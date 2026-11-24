import type { Turno } from "./agenda";

// Argentina: UTC-3 fijo. Todo se calcula en esa zona, sin depender de la TZ del servidor.
const OFFSET_MS = -3 * 3600_000;
const DIA = 24 * 3600_000;
/** Días de atención (lun-sáb) que se llenan hacia adelante, para que "Simular día siguiente" no deje la agenda vacía. */
const DIAS_A_LLENAR = 10;

// Pacientes ficticios, en el orden en que se reparten en los horarios.
const PACIENTES: { paciente: string; tratamientoId: string; estado: Turno["estado"] }[] = [
  { paciente: "Camila Rodríguez", tratamientoId: "limpieza", estado: "confirmado" },
  { paciente: "Tomás Álvarez", tratamientoId: "consulta", estado: "confirmado" },
  { paciente: "Julieta Benítez", tratamientoId: "botox", estado: "confirmado" },
  { paciente: "Martín Giménez", tratamientoId: "blanqueamiento", estado: "pendiente" },
  { paciente: "Sofía Acosta", tratamientoId: "ortodoncia", estado: "confirmado" },
  { paciente: "Nicolás Peralta", tratamientoId: "implante", estado: "confirmado" },
  { paciente: "Valentina Ríos", tratamientoId: "hialuronico", estado: "pendiente" },
  { paciente: "Agustín Molina", tratamientoId: "limpieza", estado: "confirmado" },
  { paciente: "Lucía Domínguez", tratamientoId: "limpieza-facial", estado: "confirmado" },
  { paciente: "Federico Sosa", tratamientoId: "consulta", estado: "confirmado" },
  { paciente: "Paula Herrera", tratamientoId: "limpieza", estado: "confirmado" },
  { paciente: "Joaquín Romero", tratamientoId: "consulta", estado: "confirmado" },
  { paciente: "Micaela Torres", tratamientoId: "limpieza-facial", estado: "confirmado" },
  { paciente: "Santiago Castro", tratamientoId: "implante", estado: "pendiente" },
  { paciente: "Florencia Vega", tratamientoId: "botox", estado: "confirmado" },
  { paciente: "Ignacio Medina", tratamientoId: "ortodoncia", estado: "confirmado" },
  { paciente: "Carolina Suárez", tratamientoId: "hialuronico", estado: "confirmado" },
  { paciente: "Bruno Fernández", tratamientoId: "limpieza", estado: "confirmado" },
  { paciente: "Rocío Navarro", tratamientoId: "blanqueamiento", estado: "confirmado" },
  { paciente: "Diego Ortiz", tratamientoId: "consulta", estado: "pendiente" },
];

// Horarios por día (minutos desde las 00:00). Ninguno dura más de 60 min, así que no se pisan
// y entran en el horario: lun-vie hasta las 19, sábados hasta las 13.
const HORARIOS_SEMANA = [
  [10 * 60, 16 * 60 + 30],
  [11 * 60 + 30, 15 * 60],
  [9 * 60 + 30, 17 * 60],
  [12 * 60, 14 * 60],
  [10 * 60 + 30, 18 * 60],
];
const HORARIOS_SABADO = [9 * 60 + 30, 11 * 60];

/** Turnos de ejemplo: ~2 por día de atención durante los próximos 10 días (incluye sábados a la mañana). */
export function turnosSemilla(ahora: Date): Turno[] {
  const hoy = Math.floor((ahora.getTime() + OFFSET_MS) / DIA) * DIA - OFFSET_MS; // 00:00 ART de hoy
  const out: Turno[] = [];
  let n = 0; // índice de slot (paciente e id)
  let semana = 0; // índice en HORARIOS_SEMANA
  for (let i = 0, abiertos = 0; abiertos < DIAS_A_LLENAR; i++) {
    const base = hoy + i * DIA;
    const dow = new Date(base + OFFSET_MS).getUTCDay();
    if (dow === 0) continue;
    abiertos++;
    const horarios = dow === 6 ? HORARIOS_SABADO : HORARIOS_SEMANA[semana++ % HORARIOS_SEMANA.length];
    for (const min of horarios) {
      const p = PACIENTES[n % PACIENTES.length];
      n++;
      const inicio = base + min * 60_000;
      if (inicio <= ahora.getTime()) continue; // ya pasó hoy: se omite
      out.push({
        id: `semilla-${n}`,
        paciente: p.paciente,
        tratamientoId: p.tratamientoId,
        inicio: new Date(inicio).toISOString(),
        estado: p.estado,
        origen: "semilla",
      });
    }
  }
  return out;
}
