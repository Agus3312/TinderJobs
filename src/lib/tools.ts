import { tool } from "ai";
import { z } from "zod";

// Herramientas SIN execute: las ejecuta el cliente (onToolCall) contra la agenda local.
export const tools = {
  ver_disponibilidad: tool({
    description:
      "Devuelve los próximos horarios libres para un tratamiento. Usala antes de ofrecer cualquier horario.",
    inputSchema: z.object({
      tratamientoId: z
        .string()
        .describe("ID del tratamiento, tal como figura en el catálogo de la clínica"),
    }),
  }),
  agendar_turno: tool({
    description:
      "Agenda un turno. Solo llamarla cuando el paciente confirmó nombre, tratamiento y horario.",
    inputSchema: z.object({
      paciente: z.string().describe("Nombre completo del paciente"),
      tratamientoId: z.string().describe("ID del tratamiento del catálogo"),
      inicio: z
        .string()
        .describe("ISO exacto devuelto por ver_disponibilidad, sin modificar"),
    }),
  }),
  reprogramar_turno: tool({
    description: "Cambia el horario de un turno existente a otro horario libre.",
    inputSchema: z.object({
      turnoId: z.string().describe("ID del turno a mover (de ver_mis_turnos)"),
      nuevoInicio: z
        .string()
        .describe("ISO exacto del nuevo horario, devuelto por ver_disponibilidad"),
    }),
  }),
  cancelar_turno: tool({
    description: "Cancela un turno existente. Pedir confirmación al paciente antes.",
    inputSchema: z.object({
      turnoId: z.string().describe("ID del turno a cancelar (de ver_mis_turnos)"),
    }),
  }),
  ver_mis_turnos: tool({
    description: "Lista los turnos de un paciente.",
    inputSchema: z.object({
      paciente: z.string().describe("Nombre del paciente"),
    }),
  }),
  derivar_a_humano: tool({
    description:
      "Deriva la conversación a una persona del equipo (urgencias, reclamos, pedidos fuera de alcance).",
    inputSchema: z.object({
      motivo: z.string().describe("Motivo breve de la derivación"),
    }),
  }),
};
