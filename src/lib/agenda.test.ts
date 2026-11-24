import { describe, it, expect } from "vitest";
import { clinica } from "@/config/clinica";
import {
  ahoraInicialDemo,
  claveRecordatorio,
  cuandoAmigable,
  diasDeAtencion,
  fechaAmigable,
  recordatoriosAlAgendar,
  recordatoriosNuevos,
  siguienteApertura,
  slotsLibres,
  agendar,
  reprogramar,
  cancelar,
  recordatoriosPara,
  turnosDePaciente,
  type Turno,
} from "./agenda";
import { turnosSemilla } from "./semilla";

// Martes 24/11/2026 10:00 hora Argentina
const ahora = new Date("2026-11-24T10:00:00-03:00");
const iso = (s: string) => new Date(s).toISOString();

const turno = (over: Partial<Turno> = {}): Turno => ({
  id: "t1",
  paciente: "Lucía Fernández",
  tratamientoId: "consulta",
  inicio: iso("2026-11-24T15:00:00-03:00"),
  estado: "confirmado",
  origen: "semilla",
  ...over,
});

describe("slotsLibres", () => {
  it("no devuelve horarios pasados y arranca en el próximo slot", () => {
    const s = slotsLibres([], clinica, ahora, "consulta");
    expect(s.length).toBe(6);
    expect(s[0]).toBe(iso("2026-11-24T10:30:00-03:00"));
    for (const x of s) expect(new Date(x).getTime()).toBeGreaterThan(ahora.getTime());
  });

  it("respeta el cierre considerando la duración del tratamiento", () => {
    const tarde = slotsLibres([], clinica, new Date("2026-11-24T17:50:00-03:00"), "limpieza", 1);
    // limpieza dura 45': 18:00 termina 18:45 (ok); 18:30 terminaría 19:15 (no)
    expect(tarde).toEqual([iso("2026-11-24T18:00:00-03:00")]);
  });

  it("de viernes a sábado no ofrece domingo y el sábado cierra a las 13:00", () => {
    const s = slotsLibres([], clinica, new Date("2026-11-27T18:00:00-03:00"), "consulta", 3);
    expect(s[0]).toBe(iso("2026-11-27T18:30:00-03:00"));
    expect(s[1]).toBe(iso("2026-11-28T09:00:00-03:00"));
    const arg = (x: string) => new Date(new Date(x).getTime() - 3 * 3600_000);
    for (const x of s) expect(arg(x).getUTCDay()).not.toBe(0);
  });

  it("sábado: último slot de consulta es 12:30", () => {
    const s = slotsLibres([], clinica, new Date("2026-11-28T09:00:00-03:00"), "consulta", 1);
    expect(s[0]).toBe(iso("2026-11-28T09:30:00-03:00"));
    const todos = slotsLibres([], clinica, new Date("2026-11-28T11:00:00-03:00"), "consulta", 1);
    expect(todos[todos.length - 1]).toBe(iso("2026-11-28T12:30:00-03:00"));
    expect(todos).not.toContain(iso("2026-11-28T13:00:00-03:00"));
  });

  it("no ofrece domingo", () => {
    const s = slotsLibres([], clinica, new Date("2026-11-29T08:00:00-03:00"), "consulta", 1);
    expect(s).toEqual([]);
  });

  it("slot que termina justo cuando empieza otro turno es válido; el que lo pisa no", () => {
    const t = turno({ inicio: iso("2026-11-24T11:00:00-03:00"), tratamientoId: "limpieza" });
    const s = slotsLibres([t], clinica, ahora, "consulta", 1);
    expect(s).toContain(iso("2026-11-24T10:30:00-03:00"));
    expect(s).not.toContain(iso("2026-11-24T11:00:00-03:00"));
    expect(s).not.toContain(iso("2026-11-24T11:30:00-03:00")); // 11:30 cae dentro de 11:00-11:45
    expect(s).toContain(iso("2026-11-24T12:00:00-03:00"));
  });

  it("un tratamiento largo no entra si pisa el turno siguiente", () => {
    const t = turno({ inicio: iso("2026-11-24T11:30:00-03:00"), tratamientoId: "consulta" });
    const s = slotsLibres([t], clinica, ahora, "blanqueamiento", 1); // 60'
    expect(s).toContain(iso("2026-11-24T10:30:00-03:00")); // 10:30-11:30 termina justo
    expect(s).not.toContain(iso("2026-11-24T11:00:00-03:00")); // 11:00-12:00 pisa
  });

  it("ignora turnos cancelados", () => {
    const t = turno({ inicio: iso("2026-11-24T10:30:00-03:00"), estado: "cancelado" });
    expect(slotsLibres([t], clinica, ahora, "consulta", 1)).toContain(iso("2026-11-24T10:30:00-03:00"));
  });

  it("tratamiento inexistente devuelve lista vacía", () => {
    expect(slotsLibres([], clinica, ahora, "nope")).toEqual([]);
  });

  it("no muta los turnos", () => {
    const ts = [turno()];
    const copia = JSON.stringify(ts);
    slotsLibres(ts, clinica, ahora, "consulta");
    expect(JSON.stringify(ts)).toBe(copia);
  });
});

describe("agendar", () => {
  const datos = { paciente: "Martina Gómez", tratamientoId: "limpieza", inicio: iso("2026-11-25T10:00:00-03:00") };

  it("agrega un turno confirmado con origen bot", () => {
    const base: Turno[] = [];
    const r = agendar(base, clinica, ahora, datos);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valor.turno).toMatchObject({
      paciente: "Martina Gómez",
      tratamientoId: "limpieza",
      inicio: datos.inicio,
      estado: "confirmado",
      origen: "bot",
    });
    expect(r.valor.turno.id).toBeTruthy();
    expect(r.valor.turnos).toHaveLength(1);
    expect(base).toHaveLength(0); // no muta
  });

  it("genera ids únicos", () => {
    const a = agendar([], clinica, ahora, datos);
    if (!a.ok) throw new Error("x");
    const b = agendar(a.valor.turnos, clinica, ahora, { ...datos, inicio: iso("2026-11-25T12:00:00-03:00") });
    if (!b.ok) throw new Error("y");
    expect(a.valor.turno.id).not.toBe(b.valor.turno.id);
  });

  it("error si el horario está ocupado (superposición)", () => {
    const t = turno({ inicio: iso("2026-11-25T09:30:00-03:00"), tratamientoId: "limpieza" }); // 9:30-10:15
    const r = agendar([t], clinica, ahora, datos); // 10:00-10:45
    expect(r).toEqual({ ok: false, error: "Ese horario ya está ocupado" });
  });

  it("un turno cancelado no bloquea", () => {
    const t = turno({ inicio: iso("2026-11-25T10:00:00-03:00"), estado: "cancelado" });
    expect(agendar([t], clinica, ahora, datos).ok).toBe(true);
  });

  it("error fuera de horario (antes, después, domingo, sábado tarde, se pasa del cierre)", () => {
    const err = { ok: false, error: "Fuera del horario de atención" };
    expect(agendar([], clinica, ahora, { ...datos, inicio: iso("2026-11-25T08:30:00-03:00") })).toEqual(err);
    expect(agendar([], clinica, ahora, { ...datos, inicio: iso("2026-11-25T19:00:00-03:00") })).toEqual(err);
    expect(agendar([], clinica, ahora, { ...datos, inicio: iso("2026-11-25T18:30:00-03:00") })).toEqual(err); // 45' se pasa de las 19
    expect(agendar([], clinica, ahora, { ...datos, inicio: iso("2026-11-29T10:00:00-03:00") })).toEqual(err); // domingo
    expect(agendar([], clinica, ahora, { ...datos, inicio: iso("2026-11-28T13:00:00-03:00") })).toEqual(err); // sábado tarde
  });

  it("error si ya pasó", () => {
    expect(agendar([], clinica, ahora, { ...datos, inicio: iso("2026-11-24T09:00:00-03:00") })).toEqual({
      ok: false,
      error: "Ese horario ya pasó",
    });
    expect(agendar([], clinica, ahora, { ...datos, inicio: iso("2026-11-24T10:00:00-03:00") })).toEqual({
      ok: false,
      error: "Ese horario ya pasó",
    });
  });

  it("error tratamiento inexistente", () => {
    expect(agendar([], clinica, ahora, { ...datos, tratamientoId: "xyz" })).toEqual({
      ok: false,
      error: "Tratamiento inexistente",
    });
  });
});

describe("reprogramar", () => {
  const t = turno({ id: "t1", inicio: iso("2026-11-25T10:00:00-03:00") });

  it("mueve el turno sin mutar el original", () => {
    const base = [t];
    const nuevo = iso("2026-11-26T11:00:00-03:00");
    const r = reprogramar(base, clinica, ahora, "t1", nuevo);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valor.turno.inicio).toBe(nuevo);
    expect(r.valor.turno.id).toBe("t1");
    expect(r.valor.turnos).toHaveLength(1);
    expect(base[0].inicio).toBe(iso("2026-11-25T10:00:00-03:00"));
  });

  it("ignora el propio turno al validar superposición", () => {
    const r = reprogramar([t], clinica, ahora, "t1", iso("2026-11-25T10:15:00-03:00"));
    expect(r.ok).toBe(true);
  });

  it("valida igual que agendar", () => {
    const otro = turno({ id: "t2", inicio: iso("2026-11-26T11:00:00-03:00") });
    expect(reprogramar([t, otro], clinica, ahora, "t1", iso("2026-11-26T11:15:00-03:00"))).toEqual({
      ok: false,
      error: "Ese horario ya está ocupado",
    });
    expect(reprogramar([t], clinica, ahora, "t1", iso("2026-11-25T07:00:00-03:00"))).toEqual({
      ok: false,
      error: "Fuera del horario de atención",
    });
    expect(reprogramar([t], clinica, ahora, "t1", iso("2026-11-24T09:00:00-03:00"))).toEqual({
      ok: false,
      error: "Ese horario ya pasó",
    });
  });

  it("id inexistente", () => {
    expect(reprogramar([t], clinica, ahora, "zzz", iso("2026-11-26T11:00:00-03:00"))).toEqual({
      ok: false,
      error: "Turno no encontrado",
    });
  });

  it("no permite reprogramar un turno cancelado", () => {
    const c = turno({ id: "t1", estado: "cancelado" });
    expect(reprogramar([c], clinica, ahora, "t1", iso("2026-11-26T11:00:00-03:00")).ok).toBe(false);
  });
});

describe("cancelar", () => {
  it("pone estado cancelado y libera el slot", () => {
    const t = turno({ id: "t1", inicio: iso("2026-11-25T10:00:00-03:00") });
    const base = [t];
    const r = cancelar(base, "t1");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valor.turnos[0].estado).toBe("cancelado");
    expect(base[0].estado).toBe("confirmado");
    const temprano = new Date("2026-11-25T08:00:00-03:00");
    expect(slotsLibres(r.valor.turnos, clinica, temprano, "consulta", 1)).toContain(iso("2026-11-25T10:00:00-03:00"));
    expect(slotsLibres(base, clinica, temprano, "consulta", 1)).not.toContain(iso("2026-11-25T10:00:00-03:00"));
  });

  it("id inexistente", () => {
    expect(cancelar([], "nada")).toEqual({ ok: false, error: "Turno no encontrado" });
  });
});

describe("recordatoriosPara", () => {
  it("genera 24h y 2h por turno no cancelado, con enviado según ahora", () => {
    const a = turno({ id: "a", inicio: iso("2026-11-24T11:00:00-03:00") }); // 24h antes: ayer 11:00 (enviado); 2h antes: 09:00 (enviado)
    const b = turno({ id: "b", inicio: iso("2026-11-25T11:00:00-03:00") }); // 24h: hoy 11:00 (no enviado); 2h: mañana 09:00
    const c = turno({ id: "c", inicio: iso("2026-11-24T12:00:00-03:00") }); // 24h enviado; 2h: 10:00 == ahora -> enviado
    const x = turno({ id: "x", estado: "cancelado" });
    const r = recordatoriosPara([a, b, c, x], clinica, ahora);
    expect(r).toHaveLength(6);
    expect(r.find((q) => q.turnoId === "x")).toBeUndefined();
    const get = (id: string, tipo: "24h" | "2h") => r.find((q) => q.turnoId === id && q.tipo === tipo)!;
    expect(get("a", "24h").enviarEn).toBe(iso("2026-11-23T11:00:00-03:00"));
    expect(get("a", "2h").enviarEn).toBe(iso("2026-11-24T09:00:00-03:00"));
    expect(get("a", "24h").enviado).toBe(true);
    expect(get("a", "2h").enviado).toBe(true);
    expect(get("b", "24h").enviado).toBe(false);
    expect(get("b", "2h").enviado).toBe(false);
    expect(get("c", "2h").enviado).toBe(true);
  });

  it("el texto está en español rioplatense y menciona paciente, tratamiento y clínica", () => {
    const [r24, r2] = recordatoriosPara([turno({ paciente: "Lucía Fernández", inicio: iso("2026-11-25T15:00:00-03:00") })], clinica, ahora);
    expect(r24.texto).toContain("Lucía");
    expect(r24.texto).toContain("Sonrisa Dental & Estética");
    expect(r24.texto).toContain("15:00");
    expect(r24.texto).toMatch(/mañana/i);
    expect(r2.texto).toMatch(/dos horas|2 horas/i);
    expect(r2.texto).toContain("15:00");
  });
});

describe("turnosDePaciente", () => {
  const ts = [
    turno({ id: "1", paciente: "Lucía Fernández", inicio: iso("2026-11-26T10:00:00-03:00") }),
    turno({ id: "2", paciente: "Lucia Fernandez", inicio: iso("2026-11-25T10:00:00-03:00") }),
    turno({ id: "3", paciente: "Lucía Fernández", inicio: iso("2026-11-27T10:00:00-03:00"), estado: "cancelado" }),
    turno({ id: "4", paciente: "Martín Pérez", inicio: iso("2026-11-25T12:00:00-03:00") }),
  ];

  it("ignora mayúsculas y acentos, excluye cancelados y ordena por inicio", () => {
    const r = turnosDePaciente(ts, "LUCIA fernandez");
    expect(r.map((t) => t.id)).toEqual(["2", "1"]);
  });

  it("acepta coincidencia parcial", () => {
    expect(turnosDePaciente(ts, "martin").map((t) => t.id)).toEqual(["4"]);
    expect(turnosDePaciente(ts, "Fernández").map((t) => t.id)).toEqual(["2", "1"]);
  });

  it("sin coincidencias o nombre vacío devuelve []", () => {
    expect(turnosDePaciente(ts, "Zulema")).toEqual([]);
    expect(turnosDePaciente(ts, "  ")).toEqual([]);
  });
});

describe("turnosSemilla", () => {
  it("genera ~2 turnos por día durante 10 días de atención: válidos, futuros, sin superposición", () => {
    const s = turnosSemilla(ahora);
    expect(s.length).toBeGreaterThanOrEqual(18);
    expect(s.length).toBeLessThanOrEqual(20);
    for (const t of s) {
      expect(t.origen).toBe("semilla");
      expect(t.estado).not.toBe("cancelado");
      expect(new Date(t.inicio).getTime()).toBeGreaterThan(ahora.getTime());
    }
    // reagendar cada uno sobre el resto debe ser válido => no se superponen y están en horario
    for (const t of s) {
      const otros = s.filter((x) => x.id !== t.id);
      expect(reprogramar(otros.concat(t), clinica, ahora, t.id, t.inicio).ok).toBe(true);
    }
    expect(new Set(s.map((t) => t.id)).size).toBe(s.length);
  });

  it("incluye sábados a la mañana y cubre los próximos días de atención", () => {
    const s = turnosSemilla(ahora);
    const diaArt = (t: Turno) => new Date(new Date(t.inicio).getTime() - 3 * 3600_000);
    const sabados = s.filter((t) => diaArt(t).getUTCDay() === 6);
    expect(sabados.length).toBeGreaterThanOrEqual(2);
    for (const t of sabados) expect(diaArt(t).getUTCHours()).toBeLessThan(12);
    expect(s.some((t) => diaArt(t).getUTCDay() === 0)).toBe(false);
    // 10 días de atención desde el martes 24: hasta el viernes 4/12, cada uno con algún turno
    const dias = new Set(s.map((t) => diaArt(t).toISOString().slice(0, 10)));
    expect(dias.size).toBe(10);
    expect([...dias].sort().at(-1)).toBe("2026-12-04");
  });

  it("si se carga a la tarde, omite los de hoy que ya pasaron", () => {
    const tarde = new Date("2026-11-24T17:30:00-03:00");
    for (const t of turnosSemilla(tarde)) expect(new Date(t.inicio).getTime()).toBeGreaterThan(tarde.getTime());
  });
});

describe("ahoraInicialDemo", () => {
  // Fechas en ART (UTC-3). 23/11/2026 es lunes.
  const art = (s: string) => new Date(`${s}-03:00`);
  it("dentro del horario: redondea a la hora", () => {
    expect(ahoraInicialDemo(art("2026-11-24T15:47:12"), clinica)).toEqual(art("2026-11-24T15:00:00"));
  });
  it("a la hora exacta de apertura la mantiene", () => {
    expect(ahoraInicialDemo(art("2026-11-24T09:00:00"), clinica)).toEqual(art("2026-11-24T09:00:00"));
  });
  it("antes de abrir en día hábil: hoy a las 09:00", () => {
    expect(ahoraInicialDemo(art("2026-11-24T07:15:00"), clinica)).toEqual(art("2026-11-24T09:00:00"));
  });
  it("después de cerrar: el día siguiente a las 09:00", () => {
    expect(ahoraInicialDemo(art("2026-11-24T19:00:00"), clinica)).toEqual(art("2026-11-25T09:00:00"));
    expect(ahoraInicialDemo(art("2026-11-24T23:30:00"), clinica)).toEqual(art("2026-11-25T09:00:00"));
  });
  it("viernes a la noche: sábado 09:00", () => {
    expect(ahoraInicialDemo(art("2026-11-27T20:00:00"), clinica)).toEqual(art("2026-11-28T09:00:00"));
  });
  it("sábado después de las 13: lunes 09:00", () => {
    expect(ahoraInicialDemo(art("2026-11-28T14:00:00"), clinica)).toEqual(art("2026-11-30T09:00:00"));
  });
  it("domingo: lunes 09:00", () => {
    expect(ahoraInicialDemo(art("2026-11-29T11:00:00"), clinica)).toEqual(art("2026-11-30T09:00:00"));
  });
});

describe("cuandoAmigable", () => {
  const art = (s: string) => new Date(`${s}-03:00`);
  it("hoy, mañana o día con número", () => {
    const ref = art("2026-11-24T16:30:00");
    expect(cuandoAmigable(art("2026-11-24T18:00:00"), ref)).toBe("hoy a las 18:00");
    expect(cuandoAmigable(art("2026-11-25T16:30:00"), ref)).toBe("mañana 16:30");
    expect(cuandoAmigable(art("2026-11-26T16:30:00"), ref)).toBe("el jueves 26 a las 16:30");
    expect(cuandoAmigable(art("2026-11-23T13:00:00"), ref)).toBe("ayer a las 13:00");
    expect(cuandoAmigable(art("2026-11-21T13:00:00"), ref)).toBe("el sábado 21 a las 13:00");
  });
  it("usa el día de Argentina aunque en UTC ya sea otro día", () => {
    // 22:00 ART del martes = 01:00 UTC del miércoles
    expect(cuandoAmigable(art("2026-11-25T10:00:00"), art("2026-11-24T22:00:00"))).toBe("mañana 10:00");
  });
});

describe("recordatoriosPara (texto)", () => {
  it("sigue el formato del ejemplo: nombre, tratamiento, mañana HH:MM y SÍ para confirmar", () => {
    const [r24, r2] = recordatoriosPara(
      [turno({ paciente: "Ana López", tratamientoId: "limpieza", inicio: iso("2026-11-25T16:30:00-03:00") })],
      clinica,
      ahora,
    );
    expect(r24.texto).toContain("Hola Ana 👋 te recordamos tu turno de Limpieza dental mañana 16:30");
    expect(r24.texto).toContain("Respondé *SÍ* para confirmar");
    expect(r2.texto).toContain("hoy a las 16:30");
  });
});

describe("recordatoriosNuevos", () => {
  const bot = (over: Partial<Turno> = {}) => turno({ origen: "bot", ...over });
  const art = (s: string) => new Date(`${s}-03:00`);

  it("devuelve los que pasan a enviado entre antes y despues, sólo de turnos del bot", () => {
    const b = bot({ id: "b", inicio: iso("2026-11-25T16:30:00-03:00") }); // 24h: mar 16:30; 2h: mié 14:30
    const s = turno({ id: "s", inicio: iso("2026-11-25T16:00:00-03:00") }); // semilla: se ignora
    const r = recordatoriosNuevos([b, s], clinica, art("2026-11-24T10:00:00"), art("2026-11-25T09:00:00"));
    expect(r.map((x) => `${x.turnoId}:${x.tipo}`)).toEqual(["b:24h"]);
    expect(r[0].enviarEn).toBe(iso("2026-11-24T16:30:00-03:00"));
    expect(r[0].texto).toContain("mañana 16:30");
  });

  it("no repite los que ya estaban enviados y ordena por enviarEn", () => {
    const b1 = bot({ id: "b1", inicio: iso("2026-11-25T10:00:00-03:00") }); // 24h ya enviado (mar 10:00 == antes); 2h: mié 08:00
    const b3 = bot({ id: "b3", inicio: iso("2026-11-25T16:30:00-03:00") }); // 24h: mar 16:30; 2h: mié 14:30 (todavía no)
    const r = recordatoriosNuevos([b1, b3], clinica, art("2026-11-24T10:00:00"), art("2026-11-25T09:00:00"));
    expect(r.map((x) => `${x.turnoId}:${x.tipo}`)).toEqual(["b3:24h", "b1:2h"]);
  });

  it("omite turnos que ya ocurrieron al llegar a despues (nunca 'en dos horas' de un turno pasado)", () => {
    const b2 = bot({ id: "b2", inicio: iso("2026-11-24T18:00:00-03:00") }); // 2h: mar 16:00, pero el turno es antes de mié 09:00
    expect(recordatoriosNuevos([b2], clinica, art("2026-11-24T10:00:00"), art("2026-11-25T09:00:00"))).toEqual([]);
  });

  it("ignora turnos del bot cancelados", () => {
    const b = bot({ id: "b", estado: "cancelado", inicio: iso("2026-11-25T16:30:00-03:00") });
    expect(recordatoriosNuevos([b], clinica, art("2026-11-24T10:00:00"), art("2026-11-25T09:00:00"))).toEqual([]);
  });
});

describe("siguienteApertura", () => {
  const art = (s: string) => new Date(`${s}-03:00`);
  it("día hábil: el día siguiente a las 09:00", () => {
    expect(siguienteApertura(art("2026-11-24T10:00:00"), clinica)).toEqual(art("2026-11-25T09:00:00"));
    expect(siguienteApertura(art("2026-11-24T07:00:00"), clinica)).toEqual(art("2026-11-25T09:00:00"));
  });
  it("viernes: sábado 09:00", () => {
    expect(siguienteApertura(art("2026-11-27T18:00:00"), clinica)).toEqual(art("2026-11-28T09:00:00"));
  });
  it("sábado: salta el domingo, lunes 09:00", () => {
    expect(siguienteApertura(art("2026-11-28T09:00:00"), clinica)).toEqual(art("2026-11-30T09:00:00"));
  });
  it("tarde a la noche (ya es otro día en UTC): igual cuenta el día de Argentina", () => {
    expect(siguienteApertura(art("2026-11-24T22:30:00"), clinica)).toEqual(art("2026-11-25T09:00:00"));
  });
});

describe("diasDeAtencion", () => {
  const art = (s: string) => new Date(`${s}-03:00`);
  it("5 días de atención desde hoy, salteando el domingo", () => {
    const d = diasDeAtencion(art("2026-11-26T15:00:00"), clinica); // jueves
    expect(d.map((ms) => new Date(ms).toISOString())).toEqual(
      ["2026-11-26", "2026-11-27", "2026-11-28", "2026-11-30", "2026-12-01"].map((x) => art(`${x}T00:00:00`).toISOString()),
    );
  });
});

describe("fechaAmigable", () => {
  it("día de la semana, número y hora en Argentina", () => {
    expect(fechaAmigable(new Date("2026-11-25T19:30:00Z"))).toBe("el miércoles 25 a las 16:30");
  });
});

describe("recordatoriosAlAgendar", () => {
  const art = (s: string) => new Date(`${s}-03:00`);
  const ahoraA = art("2026-11-24T15:00:00");
  const bot = (over: Partial<Turno> = {}) => turno({ origen: "bot", paciente: "Ana López", tratamientoId: "limpieza", ...over });

  it("turno nuevo con menos de 24 h: manda el aviso de 24 h ya, con texto relativo a ahora", () => {
    const t = bot({ id: "n", inicio: iso("2026-11-25T10:00:00-03:00") });
    const r = recordatoriosAlAgendar([], [t], clinica, ahoraA);
    expect(r).toHaveLength(1);
    expect(r[0].tipo).toBe("24h");
    expect(r[0].texto).toContain("mañana 10:00");
    // la clave coincide con la de recordatoriosPara (enviarEn programado original)
    const [r24] = recordatoriosPara([t], clinica, ahoraA);
    expect(claveRecordatorio(r[0])).toBe(claveRecordatorio(r24));
  });

  it("turno para hoy más tarde (más de 2 h): el texto dice hoy", () => {
    const t = bot({ id: "n", inicio: iso("2026-11-24T18:00:00-03:00") });
    expect(recordatoriosAlAgendar([], [t], clinica, ahoraA)[0].texto).toContain("hoy a las 18:00");
  });

  it("con menos de 2 h, con más de 24 h, semillas o sin cambios: nada", () => {
    const pronto = bot({ id: "p", inicio: iso("2026-11-24T16:30:00-03:00") });
    const lejos = bot({ id: "l", inicio: iso("2026-11-26T16:30:00-03:00") });
    const semilla = turno({ id: "s", inicio: iso("2026-11-25T10:00:00-03:00") });
    expect(recordatoriosAlAgendar([], [pronto, lejos, semilla], clinica, ahoraA)).toEqual([]);
    const igual = bot({ id: "i", inicio: iso("2026-11-25T10:00:00-03:00") });
    expect(recordatoriosAlAgendar([igual], [igual], clinica, ahoraA)).toEqual([]);
  });

  it("reprogramado a menos de 24 h: se manda", () => {
    const antes = bot({ id: "r", inicio: iso("2026-11-27T10:00:00-03:00") });
    const despues = { ...antes, inicio: iso("2026-11-25T11:00:00-03:00") };
    expect(recordatoriosAlAgendar([antes], [despues], clinica, ahoraA).map((x) => x.turnoId)).toEqual(["r"]);
  });
});
