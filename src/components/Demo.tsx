"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { clinica } from "@/config/clinica";
import {
  ahoraInicialDemo,
  claveRecordatorio,
  recordatoriosAlAgendar,
  recordatoriosNuevos,
  proximoSalto,
  type Recordatorio,
  type Turno,
} from "@/lib/agenda";
import { ejecutarHerramienta } from "@/lib/ejecutarHerramienta";
import { formatearAviso } from "@/lib/prompt";
import { turnosSemilla } from "@/lib/semilla";
import Chat, { ChatCargando } from "./Chat";
import PanelClinica from "./panel/PanelClinica";

/** Burbuja del bot inyectada localmente (bienvenida, recordatorios). No se envía al modelo. */
export type MensajeSistema = { id: string; texto: string; at: string };

const sinSuscripcion = () => () => {};

type Pestana = "chat" | "clinica";
const ESCRITORIO = "(min-width: 48rem)"; // breakpoint `md` de Tailwind: dos paneles lado a lado

function suscribirEscritorio(cb: () => void) {
  const mq = window.matchMedia(ESCRITORIO);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Cuántos avisos automáticos le mandamos al modelo como contexto (y su largo máximo). */
const MAX_AVISOS = 10;
const MAX_CHARS_AVISO = 500;

/**
 * Raíz de la demo. Se renderiza sólo en el cliente: el estado depende de la hora actual
 * y así evitamos diferencias de hidratación.
 */
export default function Demo() {
  const montado = useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
  return montado ? <DemoCliente /> : <ChatCargando />;
}

function estadoInicial() {
  // Si ahora la clínica está abierta, la hora actual redondeada; si no, la próxima apertura.
  const ahora = ahoraInicialDemo(new Date(), clinica);
  const bienvenida: MensajeSistema = {
    id: "bienvenida",
    at: ahora.toISOString(),
    texto: `¡Hola! 👋 Soy la asistente virtual de *${clinica.nombre}*.\nTe puedo pasar precios, ver horarios libres y reservarte un turno al instante. ¿En qué te ayudo?`,
  };
  return {
    ahora,
    turnos: turnosSemilla(ahora),
    mensajesSistema: [bienvenida],
    fijadoEn: Date.now(),
  };
}

function DemoCliente() {
  const [inicial] = useState(estadoInicial);

  // Estado de la demo (el chat y el panel de la clínica leen estos valores).
  const [ahora, setAhora] = useState<Date>(inicial.ahora);
  const [turnos, setTurnos] = useState<Turno[]>(inicial.turnos);
  const [derivaciones, setDerivaciones] = useState<string[]>([]);
  const [mensajesSistema, setMensajesSistema] = useState<MensajeSistema[]>(inicial.mensajesSistema);
  /** Recordatorios de turnos del bot que realmente se mandaron: clave -> hora de envío (ISO). */
  const [enviados, setEnviados] = useState<Record<string, string>>({});

  // Refs para leer el estado más reciente desde callbacks del chat (varias tool calls
  // pueden llegar en el mismo stream, antes de que React vuelva a renderizar).
  const turnosRef = useRef(turnos);
  const ahoraRef = useRef(ahora);
  const mensajesSistemaRef = useRef(mensajesSistema);
  // Recordatorios ya marcados como enviados que esperan a que el chat termine de responder
  // para aparecer (así no quedan antes de la confirmación del turno).
  const pendientesRef = useRef<{ id: string; texto: string }[]>([]);
  // Momento real en que se fijó `ahora`: el reloj de la demo avanza desde ahí.
  const fijadoEnRef = useRef(inicial.fijadoEn);
  // Hasta qué momento (hora simulada) ya se mandaron los recordatorios que correspondían.
  const procesadoHastaRef = useRef(inicial.ahora.getTime());
  // Claves de recordatorios ya mandados (espejo de `enviados`, legible desde callbacks).
  const enviadosRef = useRef(new Set<string>());

  // Móvil: una pestaña a la vez (el chat no se desmonta, sólo se oculta, así no pierde estado).
  const [pestana, setPestana] = useState<Pestana>("chat");
  const pestanaRef = useRef<Pestana>("chat");
  const escritorio = useSyncExternalStore(
    suscribirEscritorio,
    () => window.matchMedia(ESCRITORIO).matches,
    () => false,
  );
  const escritorioRef = useRef(escritorio);
  useEffect(() => {
    escritorioRef.current = escritorio;
  }, [escritorio]);
  /** Novedades sin ver en cada pestaña (sólo se muestran en móvil). */
  const [novedades, setNovedades] = useState<Record<Pestana, number>>({ chat: 0, clinica: 0 });
  const avisarNovedad = useCallback((en: Pestana, n = 1) => {
    if (n <= 0 || escritorioRef.current || pestanaRef.current === en) return;
    setNovedades((prev) => ({ ...prev, [en]: prev[en] + n }));
  }, []);
  const cambiarPestana = useCallback((p: Pestana) => {
    pestanaRef.current = p;
    setPestana(p);
    setNovedades((prev) => (prev[p] === 0 ? prev : { ...prev, [p]: 0 }));
  }, []);

  useEffect(() => {
    if (ahoraRef.current !== ahora) {
      ahoraRef.current = ahora;
      fijadoEnRef.current = Date.now();
    }
  }, [ahora]);

  /** Hora "simulada" de la demo: `ahora` + el tiempo real transcurrido desde que se fijó. */
  const reloj = useCallback(
    () => new Date(ahoraRef.current.getTime() + (Date.now() - fijadoEnRef.current)),
    [],
  );

  /**
   * Única vía para cambiar la agenda: actualiza ref (autoritativa, para callbacks
   * encadenados) y estado (para renderizar). Task 5 debe usarla también.
   */
  const actualizarTurnos = useCallback((nuevos: Turno[]) => {
    turnosRef.current = nuevos;
    setTurnos(nuevos);
  }, []);

  const agregarMensajes = useCallback((nuevos: MensajeSistema[]) => {
    const ids = new Set(mensajesSistemaRef.current.map((m) => m.id));
    const sumar = nuevos.filter((m) => !ids.has(m.id));
    if (sumar.length === 0) return;
    const lista = [...mensajesSistemaRef.current, ...sumar];
    mensajesSistemaRef.current = lista;
    setMensajesSistema(lista);
  }, []);

  const marcarEnviados = useCallback((recs: Recordatorio[], at: (r: Recordatorio) => string) => {
    if (recs.length === 0) return;
    for (const r of recs) enviadosRef.current.add(claveRecordatorio(r));
    setEnviados((prev) => {
      const sig = { ...prev };
      for (const r of recs) sig[claveRecordatorio(r)] ??= at(r);
      return sig;
    });
  }, []);

  /** Publica en el chat los recordatorios pendientes, sellados un instante después de "ahora". */
  const publicarPendientes = useCallback(() => {
    if (pendientesRef.current.length === 0) return;
    const at = new Date(reloj().getTime() + 1000).toISOString();
    agregarMensajes(pendientesRef.current.map((p) => ({ ...p, at })));
    // Sin aviso en la pestaña "Clínica": viene de un turno recién agendado, que ya se contó.
    pendientesRef.current = [];
  }, [agregarMensajes, reloj]);

  /**
   * Manda (como burbujas del bot, selladas a su hora de envío) los recordatorios de turnos del
   * bot que salen entre lo ya procesado y `hasta`. Devuelve cuántos mandó.
   */
  const despachar = useCallback(
    (hasta: Date) => {
      const desde = new Date(procesadoHastaRef.current);
      if (hasta.getTime() <= desde.getTime()) return 0;
      procesadoHastaRef.current = hasta.getTime();
      const recs = recordatoriosNuevos(turnosRef.current, clinica, desde, hasta).filter(
        (r) => !enviadosRef.current.has(claveRecordatorio(r)),
      );
      if (recs.length === 0) return 0;
      marcarEnviados(recs, (r) => r.enviarEn);
      agregarMensajes(recs.map((r) => ({ id: `rec-${claveRecordatorio(r)}`, texto: r.texto, at: r.enviarEn })));
      // Los recordatorios llegan al chat del paciente: avisamos en la pestaña "Chat".
      avisarNovedad("chat", recs.length);
      return recs.length;
    },
    [agregarMensajes, avisarNovedad, marcarEnviados],
  );

  // El reloj de la demo avanza solo: si en plena reunión llega la hora de un recordatorio, sale.
  useEffect(() => {
    const id = setInterval(() => despachar(reloj()), 5_000);
    return () => clearInterval(id);
  }, [despachar, reloj]);

  const onHerramienta = useCallback(
    (nombre: string, input: unknown) => {
      const previos = turnosRef.current;
      const ahoraVirtual = reloj();
      const r = ejecutarHerramienta(nombre, input, { turnos: previos, ahora: ahoraVirtual });
      if (r.turnos) {
        // Primero lo que ya tocaba mandar con la agenda anterior; los avisos vencidos del turno
        // nuevo no se mandan "atrasados" (salvo el de 24 h, abajo).
        despachar(ahoraVirtual);
        actualizarTurnos(r.turnos);
        avisarNovedad("clinica");
        // Turno del bot con menos de 24 h de anticipación: el aviso de 24 h sale ya.
        const recs = recordatoriosAlAgendar(previos, r.turnos, clinica, ahoraVirtual);
        marcarEnviados(recs, () => ahoraVirtual.toISOString());
        pendientesRef.current.push(...recs.map((x) => ({ id: `rec-${claveRecordatorio(x)}`, texto: x.texto })));
      }
      if (r.derivacion) {
        const motivo = r.derivacion;
        setDerivaciones((prev) => [...prev, motivo]);
        avisarNovedad("clinica");
      }
      return r.output;
    },
    [actualizarTurnos, avisarNovedad, despachar, marcarEnviados, reloj],
  );

  // El modelo ve la misma hora que las burbujas del chat (el reloj que avanza).
  const obtenerAhora = reloj;

  /** Avisos automáticos ya "enviados" (sin la bienvenida), para que la IA sepa qué recordó. */
  const obtenerAvisos = useCallback(
    () =>
      mensajesSistemaRef.current
        .filter((m) => m.id !== "bienvenida")
        .slice(-MAX_AVISOS)
        .map((m) => formatearAviso(m.texto, new Date(m.at)).slice(0, MAX_CHARS_AVISO)),
    [],
  );

  /**
   * "Adelantar el reloj": salta al próximo recordatorio pendiente (si sale antes de que termine
   * el próximo día de atención) o al próximo día de atención a las 09:00, y manda los
   * recordatorios de turnos del bot que salen hasta ese momento.
   */
  const simularDia = useCallback(() => {
    publicarPendientes();
    const despues = proximoSalto(turnosRef.current, clinica, reloj());
    // Refs primero: el reloj y los callbacks del chat ya ven la nueva hora.
    ahoraRef.current = despues;
    fijadoEnRef.current = Date.now();
    setAhora(despues);
    return despachar(despues);
  }, [despachar, publicarPendientes, reloj]);

  const verChat = escritorio || pestana === "chat";
  const verClinica = escritorio || pestana === "clinica";

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      <div className={`${pestana === "chat" ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col md:flex`}>
        <Chat
          className="min-h-0 flex-1"
          activo={verChat}
          mensajesSistema={mensajesSistema}
          ahora={ahora}
          obtenerAhora={obtenerAhora}
          obtenerAvisos={obtenerAvisos}
          reloj={reloj}
          onHerramienta={onHerramienta}
          onRespuestaTerminada={publicarPendientes}
        />
      </div>
      <div
        className={`${pestana === "clinica" ? "flex" : "hidden"} min-h-0 flex-1 flex-col md:flex md:w-[46%] md:max-w-[820px] md:flex-none md:shrink-0 xl:w-[52%]`}
      >
        <PanelClinica
          className="min-h-0 flex-1 max-md:border-l-0"
          activo={verClinica}
          turnos={turnos}
          ahora={ahora}
          reloj={reloj}
          derivaciones={derivaciones}
          enviados={enviados}
          onSimularDia={simularDia}
        />
      </div>
      <Pestanas actual={pestana} novedades={novedades} onCambiar={cambiarPestana} />
    </main>
  );
}

/* ---------- barra de pestañas (sólo móvil) ---------- */

const PESTANAS: { id: Pestana; etiqueta: string; icono: () => ReactNode }[] = [
  { id: "chat", etiqueta: "Chat", icono: IconoChat },
  { id: "clinica", etiqueta: "Clínica", icono: IconoClinica },
];

function Pestanas({
  actual,
  novedades,
  onCambiar,
}: {
  actual: Pestana;
  novedades: Record<Pestana, number>;
  onCambiar: (p: Pestana) => void;
}) {
  return (
    <nav
      aria-label="Secciones de la demo"
      className="z-20 shrink-0 border-t border-black/[.08] bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul role="tablist" className="mx-auto grid max-w-md grid-cols-2">
        {PESTANAS.map(({ id, etiqueta, icono: Icono }) => {
          const activa = actual === id;
          const n = novedades[id];
          return (
            <li key={id} className="flex">
              <button
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => onCambiar(id)}
                className="group flex min-h-16 flex-1 flex-col items-center justify-center gap-1 pb-1.5 pt-2 text-[12.5px] focus-visible:outline-none"
              >
                <span
                  className={`relative grid h-8 w-16 place-items-center rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-(--primario) ${
                    activa ? "bg-(--primario-suave) text-(--primario-oscuro)" : "text-[#54656f] group-active:bg-black/5"
                  }`}
                >
                  <Icono />
                  {n > 0 && (
                    <span
                      key={n}
                      className="absolute -top-1 right-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-(--primario) px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white tabular-nums animate-contador"
                    >
                      {n > 9 ? "9+" : n}
                      <span className="sr-only"> {n === 1 ? "novedad" : "novedades"}</span>
                    </span>
                  )}
                </span>
                <span className={activa ? "font-semibold text-[#111b21]" : "font-medium text-[#54656f]"}>{etiqueta}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function IconoChat() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path
        fill="currentColor"
        d="M12 3C6.98 3 3 6.58 3 11.1c0 1.86.69 3.57 1.84 4.94L4 20.4a.6.6 0 0 0 .82.66l4.13-1.8c.96.27 1.98.42 3.05.42 5.02 0 9-3.58 9-8.1S17.02 3 12 3zm-4 9.35a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"
      />
    </svg>
  );
}

function IconoClinica() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path
        fill="currentColor"
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1zm13 8H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8zm-8 1.5a1 1 0 0 1 1 1V14h1.5a1 1 0 1 1 0 2H13v1.5a1 1 0 1 1-2 0V16H9.5a1 1 0 1 1 0-2H11v-1.5a1 1 0 0 1 1-1z"
      />
    </svg>
  );
}
