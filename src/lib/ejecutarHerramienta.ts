import { clinica as clinicaPorDefecto, type ClinicaConfig } from "@/config/clinica";
import {
  agendar,
  cancelar,
  reprogramar,
  slotsLibres,
  turnosDePaciente,
  type Turno,
} from "./agenda";

export type EstadoAgenda = { turnos: Turno[]; ahora: Date };

export type ResultadoHerramienta = {
  /** Lo que se le devuelve al modelo como output de la tool. */
  output: unknown;
  /** Agenda actualizada, sólo si la herramienta la modificó. */
  turnos?: Turno[];
  /** Motivo de derivación a humano, sólo para derivar_a_humano. */
  derivacion?: string;
};

const TZ = "America/Argentina/Buenos_Aires";

/** "miércoles 25/11 10:30" en hora de Argentina, para que el modelo no tenga que convertir desde UTC. */
export function fechaLegible(iso: string): string {
  const partes = new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")} ${get("day")}/${get("month")} ${get("hour")}:${get("minute")}`;
}

const texto = (v: unknown): string => (typeof v === "string" ? v : "");

function resumenTurno(t: Turno, cfg: ClinicaConfig) {
  return {
    id: t.id,
    paciente: t.paciente,
    tratamiento: cfg.tratamientos.find((x) => x.id === t.tratamientoId)?.nombre ?? t.tratamientoId,
    inicio: t.inicio,
    cuando: fechaLegible(t.inicio),
    estado: t.estado,
  };
}

/**
 * Ejecuta una herramienta del asistente contra la agenda local (pura: no muta `estado`).
 * Los errores se devuelven como `output: { error }` para que el modelo los explique.
 */
export function ejecutarHerramienta(
  nombre: string,
  input: unknown,
  estado: EstadoAgenda,
  cfg: ClinicaConfig = clinicaPorDefecto,
): ResultadoHerramienta {
  const args = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const { turnos, ahora } = estado;

  switch (nombre) {
    case "ver_disponibilidad": {
      const tratamientoId = texto(args.tratamientoId);
      if (!cfg.tratamientos.some((t) => t.id === tratamientoId)) {
        return { output: { error: "Tratamiento inexistente" } };
      }
      const horarios = slotsLibres(turnos, cfg, ahora, tratamientoId);
      return {
        output: {
          horarios,
          horariosEnHoraArgentina: horarios.map(fechaLegible),
        },
      };
    }

    case "agendar_turno": {
      const r = agendar(turnos, cfg, ahora, {
        paciente: texto(args.paciente),
        tratamientoId: texto(args.tratamientoId),
        inicio: texto(args.inicio),
      });
      if (!r.ok) return { output: { error: r.error } };
      return { output: { ok: true, turno: resumenTurno(r.valor.turno, cfg) }, turnos: r.valor.turnos };
    }

    case "reprogramar_turno": {
      const r = reprogramar(turnos, cfg, ahora, texto(args.turnoId), texto(args.nuevoInicio));
      if (!r.ok) return { output: { error: r.error } };
      return { output: { ok: true, turno: resumenTurno(r.valor.turno, cfg) }, turnos: r.valor.turnos };
    }

    case "cancelar_turno": {
      const turnoId = texto(args.turnoId);
      const r = cancelar(turnos, turnoId);
      if (!r.ok) return { output: { error: r.error } };
      return { output: { ok: true, turnoId }, turnos: r.valor.turnos };
    }

    case "ver_mis_turnos": {
      const paciente = texto(args.paciente);
      if (!paciente.trim()) return { output: { error: "Falta el nombre del paciente" } };
      return { output: { turnos: turnosDePaciente(turnos, paciente).map((t) => resumenTurno(t, cfg)) } };
    }

    case "derivar_a_humano": {
      const motivo = texto(args.motivo).trim() || "Sin motivo especificado";
      return { output: { ok: true, mensaje: "Derivado al equipo" }, derivacion: motivo };
    }

    default:
      return { output: { error: `Herramienta desconocida: ${nombre}` } };
  }
}
