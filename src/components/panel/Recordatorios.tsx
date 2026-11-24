"use client";

import { clinica } from "@/config/clinica";
import { claveRecordatorio, cuandoAmigable, recordatoriosPara, type Recordatorio, type Turno } from "@/lib/agenda";
import { tratamientoCorto } from "./formato";

const MAX_ITEMS = 6;

type Props = {
  turnos: Turno[];
  ahora: Date;
  /** Recordatorios de turnos del bot que se mandaron de verdad: clave -> hora de envío. */
  enviados: Record<string, string>;
};

type Estado = "enviado" | "omitido" | "programado";
type Fila = { r: Recordatorio; t: Turno; estado: Estado; cuando: string; orden: string };

const CHIP: Record<Estado, { icono: string; clase: string }> = {
  enviado: { icono: "✔", clase: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  programado: { icono: "⏳", clase: "bg-slate-100 text-slate-600 ring-slate-200" },
  omitido: { icono: "–", clase: "bg-white text-slate-400 ring-slate-200" },
};

/**
 * Recordatorios automáticos por WhatsApp de turnos que todavía no ocurrieron. Para que la
 * lista sea corta: los de turnos del bot (enviados, programados u omitidos) y los próximos a
 * enviarse del resto. Primero los enviados más recientes, después omitidos y programados.
 */
export default function Recordatorios({ turnos, ahora, enviados }: Props) {
  const porId = new Map(turnos.map((t) => [t.id, t]));
  const ahoraMs = ahora.getTime();
  const filas: Fila[] = [];
  for (const r of recordatoriosPara(turnos, clinica, ahora)) {
    const t = porId.get(r.turnoId)!;
    if (new Date(t.inicio).getTime() <= ahoraMs) continue; // el turno ya pasó
    const enviadoEn = t.origen === "bot" ? enviados[claveRecordatorio(r)] : undefined;
    if (enviadoEn) {
      filas.push({ r, t, estado: "enviado", cuando: cuandoAmigable(new Date(enviadoEn), ahora), orden: enviadoEn });
    } else if (!r.enviado) {
      filas.push({ r, t, estado: "programado", cuando: cuandoAmigable(new Date(r.enviarEn), ahora), orden: r.enviarEn });
    } else if (t.origen === "bot") {
      // Venció sin mandarse: el turno se reservó con menos anticipación.
      filas.push({ r, t, estado: "omitido", cuando: "", orden: r.enviarEn });
    }
  }
  const rango: Record<Estado, number> = { enviado: 0, omitido: 1, programado: 2 };
  filas.sort((a, b) =>
    a.estado !== b.estado
      ? rango[a.estado] - rango[b.estado]
      : a.estado === "enviado"
        ? b.orden.localeCompare(a.orden)
        : a.orden.localeCompare(b.orden),
  );
  const visibles = filas.slice(0, MAX_ITEMS);
  const resto = filas.length - visibles.length;

  if (filas.length === 0) {
    return <p className="text-[13px] text-slate-500">No hay recordatorios pendientes.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-slate-100">
        {visibles.map(({ r, t, estado, cuando }) => (
          <li key={claveRecordatorio(r)} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
            <span
              className={`inline-flex w-[104px] shrink-0 items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ${CHIP[estado].clase}`}
            >
              <span aria-hidden>{CHIP[estado].icono}</span> {estado}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-[13px] font-medium ${estado === "omitido" ? "text-slate-500" : "text-slate-800"}`}>
                {t.paciente}
                <span className="font-normal text-slate-500"> · {tratamientoCorto(t.tratamientoId)}</span>
                {t.origen === "bot" && (
                  <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-px align-[1px] text-[10px] font-semibold text-amber-800">
                    ✨ por el asistente
                  </span>
                )}
              </p>
              <p className="truncate text-[12px] text-slate-500">
                Aviso {r.tipo === "24h" ? "24 h" : "2 h"} antes ·{" "}
                {estado === "enviado"
                  ? `enviado ${cuando}`
                  : estado === "programado"
                    ? `sale ${cuando}`
                    : "turno reservado con menos anticipación"}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {resto > 0 && (
        <p className="mt-2 text-[12px] text-slate-400">
          y {resto} {resto === 1 ? "recordatorio más programado" : "recordatorios más programados"}
        </p>
      )}
    </>
  );
}

export function Derivaciones({ derivaciones }: { derivaciones: string[] }) {
  if (derivaciones.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[13px] text-slate-500">
        <span aria-hidden>🙌</span>
        Nada por derivar: el asistente viene resolviendo todas las consultas.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {[...derivaciones].reverse().map((motivo, i) => (
        <li
          key={derivaciones.length - i}
          className="flex items-start gap-2.5 rounded-lg bg-orange-50 px-3 py-2 text-[13px] text-orange-950 ring-1 ring-orange-200/80 animate-entrada"
        >
          <span aria-hidden className="mt-px">🙋</span>
          <span className="min-w-0 flex-1 break-words">{motivo}</span>
          <span className="shrink-0 rounded-full bg-white px-2 py-px text-[10.5px] font-semibold text-orange-700 ring-1 ring-orange-200">
            para el equipo
          </span>
        </li>
      ))}
    </ul>
  );
}
