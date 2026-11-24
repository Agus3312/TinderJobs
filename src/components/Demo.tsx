"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clinica } from "@/config/clinica";
import { ahoraInicialDemo, recordatoriosNuevos, siguienteApertura, type Turno } from "@/lib/agenda";
import { ejecutarHerramienta } from "@/lib/ejecutarHerramienta";
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

  // Refs para leer el estado más reciente desde callbacks del chat (varias tool calls
  // pueden llegar en el mismo stream, antes de que React vuelva a renderizar).
  const turnosRef = useRef(turnos);
  const ahoraRef = useRef(ahora);
  const mensajesSistemaRef = useRef(mensajesSistema);
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

  const onHerramienta = useCallback(
    (nombre: string, input: unknown) => {
      const r = ejecutarHerramienta(nombre, input, {
        turnos: turnosRef.current,
        ahora: ahoraRef.current,
      });
      if (r.turnos) actualizarTurnos(r.turnos);
      if (r.derivacion) {
        const motivo = r.derivacion;
        setDerivaciones((prev) => [...prev, motivo]);
      }
      return r.output;
    },
    [actualizarTurnos],
  );

  const obtenerAhora = useCallback(() => ahoraRef.current, []);

  /** Avisos automáticos ya "enviados" (sin la bienvenida), para que la IA sepa qué recordó. */
  const obtenerAvisos = useCallback(
    () =>
      mensajesSistemaRef.current
        .filter((m) => m.id !== "bienvenida")
        .slice(-MAX_AVISOS)
        .map((m) => m.texto.slice(0, MAX_CHARS_AVISO)),
    [],
  );

  /**
   * "Simular día siguiente": salta al próximo día de atención a las 09:00 y manda (como
   * burbujas del bot) los recordatorios de turnos del bot que se envían en ese intervalo.
   */
  const simularDia = useCallback(() => {
    const antes = reloj();
    const despues = siguienteApertura(antes, clinica);
    const nuevos = recordatoriosNuevos(turnosRef.current, clinica, antes, despues).map(
      (r): MensajeSistema => ({ id: `rec-${r.turnoId}-${r.tipo}`, texto: r.texto, at: r.enviarEn }),
    );
    // Refs primero: el reloj y los callbacks del chat ya ven el nuevo día.
    ahoraRef.current = despues;
    fijadoEnRef.current = Date.now();
    setAhora(despues);
    if (nuevos.length > 0) {
      const ids = new Set(mensajesSistemaRef.current.map((m) => m.id));
      const lista = [...mensajesSistemaRef.current, ...nuevos.filter((m) => !ids.has(m.id))];
      mensajesSistemaRef.current = lista;
      setMensajesSistema(lista);
    }
    return nuevos.length;
  }, [reloj]);

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
      />
      <PanelClinica
        className="hidden w-[46%] max-w-[820px] shrink-0 md:flex xl:w-[52%]"
        turnos={turnos}
        ahora={ahora}
        reloj={reloj}
        derivaciones={derivaciones}
        onSimularDia={simularDia}
      />
    </main>
  );
}
