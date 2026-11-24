import type { ClinicaConfig } from "@/config/clinica";

export type EstadoTurno = "confirmado" | "pendiente" | "cancelado";
export type Turno = {
  id: string;
  paciente: string;
  tratamientoId: string;
  inicio: string; // ISO
  estado: EstadoTurno;
  origen: "bot" | "semilla";
};
export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };
export type Recordatorio = {
  turnoId: string;
  tipo: "24h" | "2h";
  enviarEn: string;
  texto: string;
  enviado: boolean;
};

// Argentina: UTC-3 fijo, sin horario de verano. Todo el cálculo de horarios
// se hace en esa zona, sin depender de la TZ del servidor.
const OFFSET_MS = -3 * 3600_000;
const MIN = 60_000;
const DIA = 24 * 3600_000;
const PASO_MIN = 30;
const MAX_SLOTS = 6;

const aArt = (ms: number) => new Date(ms + OFFSET_MS); // usar sólo getters UTC*
const minutosDelDia = (ms: number) => {
  const d = aArt(ms);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
};
const diaSemana = (ms: number) => aArt(ms).getUTCDay();
/** Epoch (ms) de las 00:00 ART del día que contiene `ms`. */
const inicioDeDia = (ms: number) => Math.floor((ms + OFFSET_MS) / DIA) * DIA - OFFSET_MS;
const hhmm = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

function ventanaDelDia(cfg: ClinicaConfig, dia: number): { desde: number; hasta: number } | null {
  if (dia === 0 || !cfg.horario.dias.includes(dia)) return null;
  const hasta = dia === 6 && cfg.horario.hastaSabado ? cfg.horario.hastaSabado : cfg.horario.hasta;
  return { desde: hhmm(cfg.horario.desde), hasta: hhmm(hasta) };
}

function dentroDeHorario(cfg: ClinicaConfig, inicioMs: number, durMin: number): boolean {
  const v = ventanaDelDia(cfg, diaSemana(inicioMs));
  if (!v) return false;
  const ini = minutosDelDia(inicioMs);
  return ini >= v.desde && ini + durMin <= v.hasta;
}

function duracionDe(cfg: ClinicaConfig, tratamientoId: string): number | undefined {
  return cfg.tratamientos.find((t) => t.id === tratamientoId)?.duracionMin;
}

function seSuperpone(turnos: Turno[], cfg: ClinicaConfig, inicioMs: number, durMin: number, ignorarId?: string) {
  const fin = inicioMs + durMin * MIN;
  return turnos.some((t) => {
    if (t.estado === "cancelado" || t.id === ignorarId) return false;
    const d = duracionDe(cfg, t.tratamientoId) ?? PASO_MIN;
    const ti = new Date(t.inicio).getTime();
    return inicioMs < ti + d * MIN && ti < fin;
  });
}

export function slotsLibres(
  turnos: Turno[],
  cfg: ClinicaConfig,
  ahora: Date,
  tratamientoId: string,
  dias = 5,
): string[] {
  const dur = duracionDe(cfg, tratamientoId);
  if (dur === undefined) return [];
  const out: string[] = [];
  const hoy = inicioDeDia(ahora.getTime());
  for (let i = 0; i < dias && out.length < MAX_SLOTS; i++) {
    const base = hoy + i * DIA;
    const v = ventanaDelDia(cfg, diaSemana(base));
    if (!v) continue;
    for (let m = v.desde; m + dur <= v.hasta && out.length < MAX_SLOTS; m += PASO_MIN) {
      const ini = base + m * MIN;
      if (ini <= ahora.getTime()) continue;
      if (seSuperpone(turnos, cfg, ini, dur)) continue;
      out.push(new Date(ini).toISOString());
    }
  }
  return out;
}

function validar(
  turnos: Turno[],
  cfg: ClinicaConfig,
  ahora: Date,
  tratamientoId: string,
  inicio: string,
  ignorarId?: string,
): Resultado<{ inicio: string }> {
  const dur = duracionDe(cfg, tratamientoId);
  if (dur === undefined) return { ok: false, error: "Tratamiento inexistente" };
  const ms = new Date(inicio).getTime();
  if (Number.isNaN(ms)) return { ok: false, error: "Fecha inválida" };
  if (ms <= ahora.getTime()) return { ok: false, error: "Ese horario ya pasó" };
  if (!dentroDeHorario(cfg, ms, dur)) return { ok: false, error: "Fuera del horario de atención" };
  if (seSuperpone(turnos, cfg, ms, dur, ignorarId)) return { ok: false, error: "Ese horario ya está ocupado" };
  return { ok: true, valor: { inicio: new Date(ms).toISOString() } };
}

function nuevoId(turnos: Turno[]): string {
  let n = turnos.length + 1;
  while (turnos.some((t) => t.id === `t-${n}`)) n++;
  return `t-${n}`;
}

export function agendar(
  turnos: Turno[],
  cfg: ClinicaConfig,
  ahora: Date,
  d: { paciente: string; tratamientoId: string; inicio: string },
): Resultado<{ turnos: Turno[]; turno: Turno }> {
  const v = validar(turnos, cfg, ahora, d.tratamientoId, d.inicio);
  if (!v.ok) return v;
  if (!d.paciente.trim()) return { ok: false, error: "Falta el nombre del paciente" };
  const turno: Turno = {
    id: nuevoId(turnos),
    paciente: d.paciente.trim(),
    tratamientoId: d.tratamientoId,
    inicio: v.valor.inicio,
    estado: "confirmado",
    origen: "bot",
  };
  return { ok: true, valor: { turnos: [...turnos, turno], turno } };
}

export function reprogramar(
  turnos: Turno[],
  cfg: ClinicaConfig,
  ahora: Date,
  id: string,
  nuevoInicio: string,
): Resultado<{ turnos: Turno[]; turno: Turno }> {
  const actual = turnos.find((t) => t.id === id);
  if (!actual) return { ok: false, error: "Turno no encontrado" };
  if (actual.estado === "cancelado") return { ok: false, error: "Ese turno está cancelado" };
  const v = validar(turnos, cfg, ahora, actual.tratamientoId, nuevoInicio, id);
  if (!v.ok) return v;
  const turno: Turno = { ...actual, inicio: v.valor.inicio };
  return { ok: true, valor: { turnos: turnos.map((t) => (t.id === id ? turno : t)), turno } };
}

export function cancelar(turnos: Turno[], id: string): Resultado<{ turnos: Turno[] }> {
  if (!turnos.some((t) => t.id === id)) return { ok: false, error: "Turno no encontrado" };
  return { ok: true, valor: { turnos: turnos.map((t) => (t.id === id ? { ...t, estado: "cancelado" as const } : t)) } };
}

const fmtHora = (ms: number) => {
  const d = aArt(ms);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};
const DIAS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function recordatoriosPara(turnos: Turno[], cfg: ClinicaConfig, ahora: Date): Recordatorio[] {
  const out: Recordatorio[] = [];
  for (const t of turnos) {
    if (t.estado === "cancelado") continue;
    const ini = new Date(t.inicio).getTime();
    const trat = cfg.tratamientos.find((x) => x.id === t.tratamientoId)?.nombre ?? "tu turno";
    const nombre = t.paciente.split(" ")[0];
    const hora = fmtHora(ini);
    const dia = aArt(ini);
    const cuando = `${DIAS_ES[dia.getUTCDay()]} ${dia.getUTCDate()}/${dia.getUTCMonth() + 1}`;
    const defs: { tipo: "24h" | "2h"; antes: number; texto: string }[] = [
      {
        tipo: "24h",
        antes: DIA,
        texto: `Hola ${nombre}! Te recordamos que mañana (${cuando}) a las ${hora} tenés turno para ${trat} en ${cfg.nombre}. Si no podés venir, avisanos y lo reprogramamos.`,
      },
      {
        tipo: "2h",
        antes: 2 * 3600_000,
        texto: `Hola ${nombre}! Te esperamos en ${cfg.nombre} en dos horas, a las ${hora}, para ${trat}. Estamos en ${cfg.direccion}.`,
      },
    ];
    for (const d of defs) {
      const enviarEn = ini - d.antes;
      out.push({
        turnoId: t.id,
        tipo: d.tipo,
        enviarEn: new Date(enviarEn).toISOString(),
        texto: d.texto,
        enviado: enviarEn <= ahora.getTime(),
      });
    }
  }
  return out;
}

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export function turnosDePaciente(turnos: Turno[], paciente: string): Turno[] {
  const q = normalizar(paciente);
  if (!q) return [];
  return turnos
    .filter((t) => t.estado !== "cancelado" && normalizar(t.paciente).includes(q))
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
}
