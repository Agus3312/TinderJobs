"use client";

/** Métricas demostrativas (constantes) + contador en vivo de la sesión. */
const EJEMPLO = [
  { valor: "142", etiqueta: "consultas respondidas", detalle: "en el último mes" },
  { valor: "38", etiqueta: "fuera de horario", detalle: "noches y fines de semana" },
  { valor: "22% → 6%", etiqueta: "ausentismo", detalle: "con recordatorios automáticos" },
  { valor: "$ 1.240.000", etiqueta: "recuperados/mes", detalle: "en turnos que no se pierden" },
];

export default function Metricas({ turnosDelBot }: { turnosDelBot: number }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-3 text-white shadow-sm">
        <span
          key={turnosDelBot}
          className="text-[30px] font-bold leading-none tabular-nums animate-contador"
          aria-live="polite"
        >
          {turnosDelBot}
        </span>
        <p className="min-w-0 text-[13px] leading-snug text-teal-50">
          <span className="font-semibold text-white">
            {turnosDelBot === 1 ? "turno agendado" : "turnos agendados"} por el asistente
          </span>{" "}
          en esta demo, sin que nadie del equipo levante el teléfono.
        </p>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide">
          <span className="size-1.5 rounded-full bg-emerald-300 animate-latido" aria-hidden />
          en vivo
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {EJEMPLO.map((m) => (
          <li key={m.etiqueta} className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/70">
              <span className="block text-[19px] font-bold leading-tight tracking-tight text-slate-900 tabular-nums">
                {m.valor}
              </span>
              <span className="block text-[12.5px] font-medium text-slate-700">{m.etiqueta}</span>
              <span className="block text-[11.5px] text-slate-400">{m.detalle}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
