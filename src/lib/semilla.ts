import type { Turno } from "./agenda";

// Argentina: UTC-3 fijo. Todo se calcula en esa zona, sin depender de la TZ del servidor.
const OFFSET_MS = -3 * 3600_000;
const DIA = 24 * 3600_000;

// Pacientes ficticios. Dos turnos por día hábil (lun-vie), en horarios que no se pisan.
const PLANTILLA: { hora: number; min: number; paciente: string; tratamientoId: string; estado: Turno["estado"] }[] = [
  { hora: 10, min: 0, paciente: "Camila Rodríguez", tratamientoId: "limpieza", estado: "confirmado" },
  { hora: 16, min: 30, paciente: "Tomás Álvarez", tratamientoId: "consulta", estado: "confirmado" },
  { hora: 11, min: 30, paciente: "Julieta Benítez", tratamientoId: "botox", estado: "confirmado" },
  { hora: 15, min: 0, paciente: "Martín Giménez", tratamientoId: "blanqueamiento", estado: "pendiente" },
  { hora: 9, min: 30, paciente: "Sofía Acosta", tratamientoId: "ortodoncia", estado: "confirmado" },
  { hora: 17, min: 0, paciente: "Nicolás Peralta", tratamientoId: "implante", estado: "confirmado" },
  { hora: 12, min: 0, paciente: "Valentina Ríos", tratamientoId: "hialuronico", estado: "pendiente" },
  { hora: 14, min: 0, paciente: "Agustín Molina", tratamientoId: "limpieza", estado: "confirmado" },
  { hora: 10, min: 30, paciente: "Lucía Domínguez", tratamientoId: "limpieza-facial", estado: "confirmado" },
  { hora: 18, min: 0, paciente: "Federico Sosa", tratamientoId: "consulta", estado: "confirmado" },
];

export function turnosSemilla(ahora: Date): Turno[] {
  const hoy = Math.floor((ahora.getTime() + OFFSET_MS) / DIA) * DIA - OFFSET_MS; // 00:00 ART de hoy
  const out: Turno[] = [];
  let dia = 0;
  let n = 0;
  while (n < PLANTILLA.length) {
    const base = hoy + dia * DIA;
    dia++;
    const dow = new Date(base + OFFSET_MS).getUTCDay();
    if (dow === 0 || dow === 6) continue;
    for (let k = 0; k < 2 && n < PLANTILLA.length; k++, n++) {
      const p = PLANTILLA[n];
      const inicio = base + (p.hora * 60 + p.min) * 60_000;
      if (inicio <= ahora.getTime()) continue; // ya pasó hoy: se omite
      out.push({
        id: `semilla-${n + 1}`,
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
