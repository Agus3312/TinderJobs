import { clinica } from "@/config/clinica";
import { inicioDelDiaArt } from "@/lib/agenda";

const TZ = "America/Argentina/Buenos_Aires";

const fmtHora = new Intl.DateTimeFormat("es-AR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const fmtDiaLargo = new Intl.DateTimeFormat("es-AR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
const fmtDiaCorto = new Intl.DateTimeFormat("es-AR", { timeZone: TZ, weekday: "short", day: "numeric" });

export const hora = (d: Date | string | number) => fmtHora.format(new Date(d));
/** "martes 24 de noviembre" */
export const diaLargo = (d: Date | string | number) => fmtDiaLargo.format(new Date(d)).replace(",", "");
/** "mar 24" (sin punto) */
export const diaCorto = (d: Date | string | number) => fmtDiaCorto.format(new Date(d)).replace(".", "").replace(",", "");

export const mismoDia = (a: Date | string | number, b: Date | string | number) =>
  inicioDelDiaArt(new Date(a).getTime()) === inicioDelDiaArt(new Date(b).getTime());

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export { capitalizar };

/** Nombre corto del tratamiento para las tarjetas: sin el "(evaluación)". */
export function tratamientoCorto(id: string): string {
  const n = clinica.tratamientos.find((t) => t.id === id)?.nombre ?? id;
  return n.replace(/\s*\(.*\)\s*$/, "");
}

const ESTETICA = new Set(["botox", "hialuronico", "limpieza-facial"]);
/** Dental (verde agua) o estética (rosa), para el color de las tarjetas. */
export const esEstetica = (id: string) => ESTETICA.has(id);
