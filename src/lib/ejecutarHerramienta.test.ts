import { describe, expect, it } from "vitest";
import { clinica } from "@/config/clinica";
import type { Turno } from "./agenda";
import { ejecutarHerramienta, fechaLegible } from "./ejecutarHerramienta";

// Lunes 23/11/2026 12:00 ART (UTC-3)
const ahora = new Date("2026-11-23T15:00:00.000Z");
const existente: Turno = {
  id: "t-1",
  paciente: "Ana López",
  tratamientoId: "limpieza",
  inicio: "2026-11-24T13:00:00.000Z", // martes 10:00 ART
  estado: "confirmado",
  origen: "semilla",
};
const estado = { turnos: [existente], ahora };

describe("fechaLegible", () => {
  it("muestra la hora de Argentina, no UTC", () => {
    expect(fechaLegible("2026-11-24T13:00:00.000Z")).toBe("martes 24/11 10:00");
  });
});

describe("ejecutarHerramienta", () => {
  type Disp = { horarios: { inicio: string; cuando: string }[]; aviso?: string; alternativas?: { inicio: string; cuando: string }[] };

  it("ver_disponibilidad sin día: cada horario con su ISO y su versión legible, en varios días", () => {
    const r = ejecutarHerramienta("ver_disponibilidad", { tratamientoId: "limpieza" }, estado);
    const out = r.output as Disp;
    expect(out.horarios.length).toBe(6);
    expect(out.horarios[0]).toEqual({ inicio: "2026-11-23T17:00:00.000Z", cuando: "lunes 23/11 14:00" });
    expect(new Set(out.horarios.map((h) => h.cuando.split(" ")[1])).size).toBe(3);
    expect(out.aviso).toBeUndefined();
    expect(r.turnos).toBeUndefined();
  });

  it("ver_disponibilidad con día y franja", () => {
    const r = ejecutarHerramienta(
      "ver_disponibilidad",
      { tratamientoId: "limpieza", dia: "2026-11-26", franja: "tarde" },
      estado,
    );
    const out = r.output as Disp;
    expect(out.horarios.map((h) => h.cuando)).toEqual(
      ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((h) => `jueves 26/11 ${h}`),
    );
  });

  it("ver_disponibilidad ignora dia/franja vacíos o null (el modelo a veces los manda así)", () => {
    const r = ejecutarHerramienta("ver_disponibilidad", { tratamientoId: "limpieza", dia: null, franja: "" }, estado);
    expect((r.output as Disp).horarios.length).toBe(6);
  });

  it("ver_disponibilidad un domingo: aviso y alternativas del día más cercano", () => {
    const r = ejecutarHerramienta("ver_disponibilidad", { tratamientoId: "consulta", dia: "2026-11-29" }, estado);
    const out = r.output as Disp;
    expect(out.horarios).toEqual([]);
    expect(out.aviso).toBe("La clínica no atiende ese día.");
    expect(out.alternativas?.length).toBe(3);
    for (const a of out.alternativas!) expect(a.cuando.startsWith("lunes 30/11")).toBe(true);
  });

  it("ver_disponibilidad con un día pasado o mal escrito devuelve error", () => {
    expect(ejecutarHerramienta("ver_disponibilidad", { tratamientoId: "consulta", dia: "2026-11-20" }, estado).output).toEqual({
      error: "Ese día ya pasó",
    });
    expect(
      (ejecutarHerramienta("ver_disponibilidad", { tratamientoId: "consulta", dia: "jueves" }, estado).output as { error?: string }).error,
    ).toBeDefined();
  });

  it("ver_disponibilidad con tratamiento inexistente devuelve error", () => {
    const r = ejecutarHerramienta("ver_disponibilidad", { tratamientoId: "lifting" }, estado);
    expect(r.output).toEqual({ error: "Tratamiento inexistente" });
  });

  it("agendar_turno agrega el turno y devuelve la agenda nueva", () => {
    const r = ejecutarHerramienta(
      "agendar_turno",
      { paciente: "Juan Pérez", tratamientoId: "consulta", inicio: "2026-11-25T14:00:00.000Z" },
      estado,
    );
    expect(r.turnos).toHaveLength(2);
    const out = r.output as { ok: boolean; turno: { id: string; tratamiento: string; cuando: string } };
    expect(out.ok).toBe(true);
    expect(out.turno.tratamiento).toBe("Consulta y evaluación");
    expect(out.turno.cuando).toBe("miércoles 25/11 11:00");
    expect(r.turnos?.find((t) => t.id === out.turno.id)?.origen).toBe("bot");
    // no muta el estado original
    expect(estado.turnos).toHaveLength(1);
  });

  it("agendar_turno en un horario ocupado devuelve error y no toca la agenda", () => {
    const r = ejecutarHerramienta(
      "agendar_turno",
      { paciente: "Juan", tratamientoId: "consulta", inicio: existente.inicio },
      estado,
    );
    expect(r.output).toEqual({ error: "Ese horario ya está ocupado" });
    expect(r.turnos).toBeUndefined();
  });

  it("agendar_turno con input malformado devuelve error", () => {
    const r = ejecutarHerramienta("agendar_turno", null, estado);
    expect(r.output).toHaveProperty("error");
    expect(r.turnos).toBeUndefined();
  });

  it("reprogramar_turno mueve el turno", () => {
    const r = ejecutarHerramienta(
      "reprogramar_turno",
      { turnoId: "t-1", nuevoInicio: "2026-11-24T17:00:00.000Z" },
      estado,
    );
    expect(r.turnos?.[0].inicio).toBe("2026-11-24T17:00:00.000Z");
    expect((r.output as { turno: { cuando: string } }).turno.cuando).toBe("martes 24/11 14:00");
  });

  it("reprogramar_turno con id inexistente devuelve error", () => {
    const r = ejecutarHerramienta("reprogramar_turno", { turnoId: "nope", nuevoInicio: existente.inicio }, estado);
    expect(r.output).toEqual({ error: "Turno no encontrado" });
  });

  it("cancelar_turno marca el turno como cancelado", () => {
    const r = ejecutarHerramienta("cancelar_turno", { turnoId: "t-1" }, estado);
    expect(r.output).toEqual({ ok: true, turnoId: "t-1" });
    expect(r.turnos?.[0].estado).toBe("cancelado");
  });

  it("cancelar_turno con id inexistente devuelve error", () => {
    const r = ejecutarHerramienta("cancelar_turno", { turnoId: "x" }, estado);
    expect(r.output).toEqual({ error: "Turno no encontrado" });
    expect(r.turnos).toBeUndefined();
  });

  it("ver_mis_turnos lista los turnos del paciente con nombre de tratamiento", () => {
    const r = ejecutarHerramienta("ver_mis_turnos", { paciente: "ana lopez" }, estado);
    expect(r.output).toEqual({
      turnos: [
        {
          id: "t-1",
          paciente: "Ana López",
          tratamiento: "Limpieza dental",
          inicio: existente.inicio,
          cuando: "martes 24/11 10:00",
          estado: "confirmado",
        },
      ],
    });
  });

  it("ver_mis_turnos sin nombre devuelve error", () => {
    const r = ejecutarHerramienta("ver_mis_turnos", { paciente: "  " }, estado);
    expect(r.output).toHaveProperty("error");
  });

  it("derivar_a_humano devuelve la derivación", () => {
    const r = ejecutarHerramienta("derivar_a_humano", { motivo: "Dolor fuerte de muela" }, estado);
    expect(r.output).toEqual({ ok: true, mensaje: "Derivado al equipo" });
    expect(r.derivacion).toBe("Dolor fuerte de muela");
    expect(r.turnos).toBeUndefined();
  });

  it("herramienta desconocida devuelve error", () => {
    const r = ejecutarHerramienta("borrar_todo", {}, estado, clinica);
    expect(r.output).toEqual({ error: "Herramienta desconocida: borrar_todo" });
    expect(r.turnos).toBeUndefined();
    expect(r.derivacion).toBeUndefined();
  });
});
