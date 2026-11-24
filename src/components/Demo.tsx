"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clinica } from "@/config/clinica";
import type { Turno } from "@/lib/agenda";
import { ejecutarHerramienta } from "@/lib/ejecutarHerramienta";
import { turnosSemilla } from "@/lib/semilla";
import Chat, { ChatCargando } from "./Chat";

/** Burbuja del bot inyectada localmente (bienvenida, recordatorios). No se envía al modelo. */
export type MensajeSistema = { id: string; texto: string; at: string };

const sinSuscripcion = () => () => {};

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
  const ahora = new Date();
  ahora.setUTCMinutes(0, 0, 0); // hora "redonda" (Argentina es UTC-3 entero): p. ej., 15:00
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

  // Estado de la demo (Task 5: PanelClinica lee estos valores).
  const [ahora] = useState<Date>(inicial.ahora);
  const [turnos, setTurnos] = useState<Turno[]>(inicial.turnos);
  const [derivaciones, setDerivaciones] = useState<string[]>([]);
  const [mensajesSistema] = useState<MensajeSistema[]>(inicial.mensajesSistema);

  // Refs para leer el estado más reciente desde callbacks del chat (varias tool calls
  // pueden llegar en el mismo stream, antes de que React vuelva a renderizar).
  const turnosRef = useRef(turnos);
  const ahoraRef = useRef(ahora);
  // Momento real en que se fijó `ahora`: el reloj de la demo avanza desde ahí.
  const fijadoEnRef = useRef(inicial.fijadoEn);

  useEffect(() => {
    turnosRef.current = turnos;
  }, [turnos]);
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

  const onHerramienta = useCallback(
    (nombre: string, input: unknown) => {
      const r = ejecutarHerramienta(nombre, input, {
        turnos: turnosRef.current,
        ahora: ahoraRef.current,
      });
      if (r.turnos) {
        turnosRef.current = r.turnos;
        setTurnos(r.turnos);
      }
      if (r.derivacion) {
        const motivo = r.derivacion;
        setDerivaciones((prev) => [...prev, motivo]);
      }
      return r.output;
    },
    [],
  );

  const obtenerAhora = useCallback(() => ahoraRef.current, []);

  return (
    <main className="flex h-dvh w-full overflow-hidden">
      <Chat
        className="min-w-0 flex-1"
        mensajesSistema={mensajesSistema}
        obtenerAhora={obtenerAhora}
        reloj={reloj}
        onHerramienta={onHerramienta}
      />
      {/* Task 5: <PanelClinica turnos={turnos} ahora={ahora} derivaciones={derivaciones} … /> */}
    </main>
  );
}
