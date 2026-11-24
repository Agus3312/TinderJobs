"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clinica } from "@/config/clinica";
import {
  ahoraInicialDemo,
  claveRecordatorio,
  recordatoriosAlAgendar,
  recordatoriosNuevos,
  siguienteApertura,
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
    pendientesRef.current = [];
  }, [agregarMensajes, reloj]);

  const onHerramienta = useCallback(
    (nombre: string, input: unknown) => {
      const previos = turnosRef.current;
      const r = ejecutarHerramienta(nombre, input, {
        turnos: previos,
        ahora: ahoraRef.current,
      });
      if (r.turnos) {
        actualizarTurnos(r.turnos);
        // Turno del bot con menos de 24 h de anticipación: el aviso de 24 h sale ya.
        const ahoraVirtual = reloj();
        const recs = recordatoriosAlAgendar(previos, r.turnos, clinica, ahoraVirtual);
        marcarEnviados(recs, () => ahoraVirtual.toISOString());
        pendientesRef.current.push(...recs.map((x) => ({ id: `rec-${claveRecordatorio(x)}`, texto: x.texto })));
      }
      if (r.derivacion) {
        const motivo = r.derivacion;
        setDerivaciones((prev) => [...prev, motivo]);
      }
      return r.output;
    },
    [actualizarTurnos, marcarEnviados, reloj],
  );

  const obtenerAhora = useCallback(() => ahoraRef.current, []);

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
   * "Simular día siguiente": salta al próximo día de atención a las 09:00 y manda (como
   * burbujas del bot) los recordatorios de turnos del bot que se envían en ese intervalo.
   */
  const simularDia = useCallback(() => {
    publicarPendientes();
    const antes = reloj();
    const despues = siguienteApertura(antes, clinica);
    const recs = recordatoriosNuevos(turnosRef.current, clinica, antes, despues);
    // Refs primero: el reloj y los callbacks del chat ya ven el nuevo día.
    ahoraRef.current = despues;
    fijadoEnRef.current = Date.now();
    setAhora(despues);
    marcarEnviados(recs, (r) => r.enviarEn);
    agregarMensajes(recs.map((r) => ({ id: `rec-${claveRecordatorio(r)}`, texto: r.texto, at: r.enviarEn })));
    return recs.length;
  }, [agregarMensajes, marcarEnviados, publicarPendientes, reloj]);

  return (
    <main className="flex h-dvh w-full overflow-hidden">
      <Chat
        className="min-w-0 flex-1"
        mensajesSistema={mensajesSistema}
        ahora={ahora}
        obtenerAhora={obtenerAhora}
        obtenerAvisos={obtenerAvisos}
        reloj={reloj}
        onHerramienta={onHerramienta}
        onRespuestaTerminada={publicarPendientes}
      />
      <PanelClinica
        className="hidden w-[46%] max-w-[820px] shrink-0 md:flex xl:w-[52%]"
        turnos={turnos}
        ahora={ahora}
        reloj={reloj}
        derivaciones={derivaciones}
        enviados={enviados}
        onSimularDia={simularDia}
      />
    </main>
  );
}
