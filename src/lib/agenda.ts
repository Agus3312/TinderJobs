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

export type Franja = "mañana" | "tarde";
/** Franjas en minutos desde las 00:00 (hora de Argentina): mañana antes de las 13, tarde desde las 13. */
const FRANJAS: Record<Franja, [number, number]> = { mañana: [0, 13 * 60], tarde: [13 * 60, 24 * 60] };
/** Hasta cuántos días adelante se busca lugar. */
const DIAS_BUSQUEDA = 14;
/** Máximo de días a futuro que se puede pedir con `dia`. */
const DIAS_MAX_PEDIDO = 60;
const POR_DIA_SIN_FECHA = 2;
const DIAS_SIN_FECHA = 3;
const MAX_ALTERNATIVAS = 3;

/** Slots libres (epoch ms) del día que empieza en `base` (00:00 ART), posteriores a `ahora` y dentro de la franja. */
function slotsDelDia(turnos: Turno[], cfg: ClinicaConfig, ahora: Date, dur: number, base: number, franja?: Franja): number[] {
  const v = ventanaDelDia(cfg, diaSemana(base));
  if (!v) return [];
  const [fDesde, fHasta] = franja ? FRANJAS[franja] : [0, 24 * 60];
  const out: number[] = [];
  for (let m = v.desde; m + dur <= v.hasta; m += PASO_MIN) {
    if (m < fDesde || m >= fHasta) continue;
    const ini = base + m * MIN;
    if (ini <= ahora.getTime() || seSuperpone(turnos, cfg, ini, dur)) continue;
    out.push(ini);
  }
  return out;
}

/** Elige `k` elementos repartidos a lo largo de `xs` (centrados en k tramos iguales), en orden. */
function repartir<T>(xs: T[], k: number): T[] {
  if (xs.length <= k) return xs;
  return Array.from({ length: k }, (_, i) => xs[Math.floor(((i + 0.5) * xs.length) / k)]);
}

/** "AAAA-MM-DD" -> epoch ms de las 00:00 ART de ese día, o null si no es una fecha válida. */
function parsearDia(dia: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia.trim());
  if (!m) return null;
  const [y, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const utc = Date.UTC(y, mes - 1, d);
  const f = new Date(utc);
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== d) return null;
  return utc - OFFSET_MS;
}

export type Busqueda = {
  /** Horarios para ofrecer (ISO), en orden. */
  horarios: string[];
  /** Si se pidió un día y no hay lugar: horarios del día con lugar más cercano. */
  alternativas: string[];
  /** Por qué no hay horarios el día pedido. */
  motivo?: "cerrado" | "sin_lugar";
};

/**
 * Horarios para ofrecer de un tratamiento. Con `dia` ("AAAA-MM-DD", hora de Argentina): hasta 6
 * horarios libres de ese día, repartidos a lo largo del día (y si no hay, alternativas del día con
 * lugar más cercano). Sin `dia`: 2 por día en los próximos 3 días con lugar. `franja` filtra
 * mañana (antes de las 13) o tarde (desde las 13).
 */
export function buscarHorarios(
  turnos: Turno[],
  cfg: ClinicaConfig,
  ahora: Date,
  tratamientoId: string,
  opts: { dia?: string; franja?: Franja } = {},
): Resultado<Busqueda> {
  const dur = duracionDe(cfg, tratamientoId);
  if (dur === undefined) return { ok: false, error: "Tratamiento inexistente" };
  const { franja } = opts;
  if (franja !== undefined && !(franja in FRANJAS)) return { ok: false, error: "Franja inválida: usá mañana o tarde" };
  const hoy = inicioDeDia(ahora.getTime());
  const iso = (ms: number) => new Date(ms).toISOString();

  if (opts.dia !== undefined) {
    const base = parsearDia(opts.dia);
    if (base === null) return { ok: false, error: "Fecha inválida: usá el formato AAAA-MM-DD" };
    if (base < hoy) return { ok: false, error: "Ese día ya pasó" };
    if (base > hoy + DIAS_MAX_PEDIDO * DIA) return { ok: false, error: "Todavía no hay agenda para esa fecha" };
    const slots = slotsDelDia(turnos, cfg, ahora, dur, base, franja);
    if (slots.length > 0) return { ok: true, valor: { horarios: repartir(slots, MAX_SLOTS).map(iso), alternativas: [] } };
    const motivo = ventanaDelDia(cfg, diaSemana(base)) ? "sin_lugar" : "cerrado";
    for (let i = 1; i <= DIAS_BUSQUEDA; i++) {
      const otros = slotsDelDia(turnos, cfg, ahora, dur, base + i * DIA, franja);
      if (otros.length > 0) {
        return { ok: true, valor: { horarios: [], alternativas: repartir(otros, MAX_ALTERNATIVAS).map(iso), motivo } };
      }
    }
    return { ok: true, valor: { horarios: [], alternativas: [], motivo } };
  }

  const horarios: string[] = [];
  for (let i = 0, dias = 0; i < DIAS_BUSQUEDA && dias < DIAS_SIN_FECHA; i++) {
    const slots = slotsDelDia(turnos, cfg, ahora, dur, hoy + i * DIA, franja);
    if (slots.length === 0) continue;
    dias++;
    horarios.push(...repartir(slots, POR_DIA_SIN_FECHA).map(iso));
  }
  return { ok: true, valor: { horarios, alternativas: [] } };
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

/**
 * Fecha amigable de `inicio` vista desde `referencia` (ambas en hora de Argentina):
 * "hoy a las 16:30", "mañana 16:30", "ayer a las 16:30" o "el jueves 26 a las 16:30".
 */
export function cuandoAmigable(inicio: Date, referencia: Date): string {
  const ini = inicio.getTime();
  const dias = Math.round((inicioDeDia(ini) - inicioDeDia(referencia.getTime())) / DIA);
  const hora = fmtHora(ini);
  if (dias === 0) return `hoy a las ${hora}`;
  if (dias === 1) return `mañana ${hora}`;
  if (dias === -1) return `ayer a las ${hora}`;
  return fechaAmigable(inicio);
}

/** "el miércoles 25 a las 16:30" (hora de Argentina). */
export function fechaAmigable(d: Date): string {
  const ms = d.getTime();
  const a = aArt(ms);
  return `el ${DIAS_ES[a.getUTCDay()]} ${a.getUTCDate()} a las ${fmtHora(ms)}`;
}

/** Texto del recordatorio de `t`, con la fecha expresada respecto de `referencia` (cuando se envía). */
export function textoRecordatorio(t: Turno, cfg: ClinicaConfig, tipo: "24h" | "2h", referencia: Date): string {
  const trat = cfg.tratamientos.find((x) => x.id === t.tratamientoId)?.nombre ?? "tu tratamiento";
  const nombre = t.paciente.trim().split(/\s+/)[0];
  const cuando = cuandoAmigable(new Date(t.inicio), referencia);
  return tipo === "24h"
    ? `Hola ${nombre} 👋 te recordamos tu turno de ${trat} ${cuando} en *${cfg.nombre}*. Respondé *SÍ* para confirmar o avisanos si necesitás cambiarlo.`
    : `Hola ${nombre} 😊 te esperamos ${cuando} (en dos horas) para tu ${trat} en *${cfg.nombre}*, ${cfg.direccion}. ¡Nos vemos!`;
}

/** Identificador estable de un recordatorio (cambia si el turno se reprograma). */
export const claveRecordatorio = (r: Pick<Recordatorio, "turnoId" | "tipo" | "enviarEn">) =>
  `${r.turnoId}-${r.tipo}-${r.enviarEn}`;

export function recordatoriosPara(turnos: Turno[], cfg: ClinicaConfig, ahora: Date): Recordatorio[] {
  const out: Recordatorio[] = [];
  for (const t of turnos) {
    if (t.estado === "cancelado") continue;
    const ini = new Date(t.inicio).getTime();
    const defs: { tipo: "24h" | "2h"; antes: number }[] = [
      { tipo: "24h", antes: DIA },
      { tipo: "2h", antes: 2 * 3600_000 },
    ];
    for (const d of defs) {
      const enviarEn = ini - d.antes;
      out.push({
        turnoId: t.id,
        tipo: d.tipo,
        enviarEn: new Date(enviarEn).toISOString(),
        texto: textoRecordatorio(t, cfg, d.tipo, new Date(enviarEn)),
        enviado: enviarEn <= ahora.getTime(),
      });
    }
  }
  return out;
}

/**
 * Recordatorios que se "envían" al pasar el tiempo de `antes` a `despues`: los que no
 * estaban enviados y ahora sí, sólo de turnos agendados por el bot, no cancelados y que
 * todavía no ocurrieron en `despues`. Ordenados por `enviarEn`.
 */
export function recordatoriosNuevos(turnos: Turno[], cfg: ClinicaConfig, antes: Date, despues: Date): Recordatorio[] {
  const delBot = turnos.filter(
    (t) => t.origen === "bot" && t.estado !== "cancelado" && new Date(t.inicio).getTime() > despues.getTime(),
  );
  const yaEnviados = new Set(
    recordatoriosPara(delBot, cfg, antes)
      .filter((r) => r.enviado)
      .map((r) => `${r.turnoId}:${r.tipo}`),
  );
  return recordatoriosPara(delBot, cfg, despues)
    .filter((r) => r.enviado && !yaEnviados.has(`${r.turnoId}:${r.tipo}`))
    .sort((a, b) => a.enviarEn.localeCompare(b.enviarEn));
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

/**
 * Momento con el que arranca la demo: si `real` cae dentro del horario de atención
 * (hora de Argentina), `real` redondeado a la hora; si no, el próximo día de atención
 * a la hora de apertura.
 */
export function ahoraInicialDemo(real: Date, cfg: ClinicaConfig): Date {
  const ms = real.getTime();
  const v = ventanaDelDia(cfg, diaSemana(ms));
  const min = minutosDelDia(ms);
  if (v && min >= v.desde && min < v.hasta) {
    return new Date(Math.floor(ms / 3600_000) * 3600_000); // ART es UTC-3 entero
  }
  const hoy = inicioDeDia(ms);
  for (let i = 0; i <= 7; i++) {
    const base = hoy + i * DIA;
    const w = ventanaDelDia(cfg, diaSemana(base));
    if (!w) continue;
    const apertura = base + w.desde * MIN;
    if (apertura > ms) return new Date(apertura);
  }
  return new Date(Math.floor(ms / 3600_000) * 3600_000); // sin días de atención: no debería pasar
}

/** "Simular día siguiente": el próximo día de atención (posterior al de `ahora`) a la hora de apertura. */
export function siguienteApertura(ahora: Date, cfg: ClinicaConfig): Date {
  const hoy = inicioDeDia(ahora.getTime());
  for (let i = 1; i <= 7; i++) {
    const base = hoy + i * DIA;
    const v = ventanaDelDia(cfg, diaSemana(base));
    if (v) return new Date(base + v.desde * MIN);
  }
  return new Date(hoy + DIA + hhmm(cfg.horario.desde) * MIN); // sin días de atención: no debería pasar
}

/**
 * "Adelantar el reloj": al próximo recordatorio pendiente de un turno del bot, si sale antes de
 * que termine el próximo día de atención; si no, a la apertura del próximo día de atención.
 * Así cada salto muestra un recordatorio (24 h y después 2 h) con su hora real de envío.
 */
export function proximoSalto(turnos: Turno[], cfg: ClinicaConfig, ahora: Date): Date {
  const apertura = siguienteApertura(ahora, cfg);
  const limite = inicioDeDia(apertura.getTime()) + DIA;
  const delBot = turnos.filter(
    (t) => t.origen === "bot" && t.estado !== "cancelado" && new Date(t.inicio).getTime() > ahora.getTime(),
  );
  let proximo = Infinity;
  for (const r of recordatoriosPara(delBot, cfg, ahora)) {
    if (!r.enviado) proximo = Math.min(proximo, new Date(r.enviarEn).getTime());
  }
  return proximo < limite ? new Date(proximo) : apertura;
}

/**
 * Los próximos `n` días de atención desde el día de `ahora` (incluido si atiende), como
 * epoch ms de las 00:00 ART de cada día.
 */
export function diasDeAtencion(ahora: Date, cfg: ClinicaConfig, n = 5): number[] {
  const out: number[] = [];
  const hoy = inicioDeDia(ahora.getTime());
  for (let i = 0; out.length < n && i < n * 3; i++) {
    const base = hoy + i * DIA;
    if (ventanaDelDia(cfg, diaSemana(base))) out.push(base);
  }
  return out;
}

/** Epoch (ms) de las 00:00 hora de Argentina del día que contiene `ms`. */
export const inicioDelDiaArt = inicioDeDia;

/**
 * Al agendar (o reprogramar) un turno del bot con menos de 24 h de anticipación, el aviso
 * de 24 h ya "venció": se manda en ese momento, con el texto relativo a `ahora`. Si faltan
 * menos de 2 h no se manda nada (la persona acaba de reservar). `enviarEn` conserva el
 * horario programado original, para que `claveRecordatorio` coincida con `recordatoriosPara`.
 */
export function recordatoriosAlAgendar(antes: Turno[], despues: Turno[], cfg: ClinicaConfig, ahora: Date): Recordatorio[] {
  const previo = new Map(antes.map((t) => [t.id, t]));
  const out: Recordatorio[] = [];
  for (const t of despues) {
    if (t.origen !== "bot" || t.estado === "cancelado") continue;
    const p = previo.get(t.id);
    if (p && p.inicio === t.inicio && p.estado !== "cancelado") continue; // sin cambios
    if (new Date(t.inicio).getTime() <= ahora.getTime()) continue;
    const [r24, r2] = recordatoriosPara([t], cfg, ahora);
    if (r24.enviado && !r2.enviado) out.push({ ...r24, texto: textoRecordatorio(t, cfg, "24h", ahora) });
  }
  return out;
}
