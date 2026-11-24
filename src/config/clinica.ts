export type Tratamiento = {
  id: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  descripcion: string;
};

export type ClinicaConfig = {
  nombre: string;
  colorPrimario: string;
  logoEmoji: string;
  direccion: string;
  telefono: string;
  /** dias: 1=lunes .. 6=sábado (domingo=0 nunca atiende). Horas "HH:MM" en hora de Argentina (UTC-3). hastaSabado: cierre especial de los sábados. */
  horario: { dias: number[]; desde: string; hasta: string; hastaSabado?: string };
  tratamientos: Tratamiento[];
  obrasSociales: string[];
};

export const clinica: ClinicaConfig = {
  nombre: "Sonrisa Dental & Estética",
  colorPrimario: "#0d9488",
  logoEmoji: "🦷",
  direccion: "Av. Santa Fe 2450, 3° B, Recoleta, CABA",
  telefono: "+54 11 5555-0142",
  // Lun-vie 09:00-19:00, sáb 09:00-13:00
  horario: { dias: [1, 2, 3, 4, 5, 6], desde: "09:00", hasta: "19:00", hastaSabado: "13:00" },
  tratamientos: [
    {
      id: "consulta",
      nombre: "Consulta y evaluación",
      precio: 25000,
      duracionMin: 30,
      descripcion: "Primera visita: revisión completa, diagnóstico y plan de tratamiento.",
    },
    {
      id: "limpieza",
      nombre: "Limpieza dental",
      precio: 45000,
      duracionMin: 45,
      descripcion: "Limpieza profunda con ultrasonido y pulido. Recomendada cada 6 meses.",
    },
    {
      id: "blanqueamiento",
      nombre: "Blanqueamiento dental",
      precio: 180000,
      duracionMin: 60,
      descripcion: "Blanqueamiento en consultorio con luz LED, hasta 8 tonos más claro.",
    },
    {
      id: "ortodoncia",
      nombre: "Ortodoncia invisible (evaluación)",
      precio: 35000,
      duracionMin: 45,
      descripcion: "Estudio, escaneo 3D y simulación de tu sonrisa con alineadores transparentes.",
    },
    {
      id: "implante",
      nombre: "Implante dental (evaluación)",
      precio: 40000,
      duracionMin: 45,
      descripcion: "Evaluación con tomografía para planificar tu implante.",
    },
    {
      id: "botox",
      nombre: "Botox",
      precio: 220000,
      duracionMin: 30,
      descripcion: "Toxina botulínica para suavizar arrugas de expresión (frente, entrecejo, patas de gallo).",
    },
    {
      id: "hialuronico",
      nombre: "Ácido hialurónico",
      precio: 260000,
      duracionMin: 45,
      descripcion: "Relleno para labios, surcos y pómulos, con resultado natural.",
    },
    {
      id: "limpieza-facial",
      nombre: "Limpieza facial",
      precio: 55000,
      duracionMin: 60,
      descripcion: "Limpieza profunda, extracción, peeling suave e hidratación.",
    },
  ],
  obrasSociales: ["OSDE", "Swiss Medical", "Galeno", "Medicus", "Omint"],
};
