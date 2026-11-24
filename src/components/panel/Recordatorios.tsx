"use client";

import { clinica } from "@/config/clinica";
import { cuandoAmigable, recordatoriosPara, type Turno } from "@/lib/agenda";
import { tratamientoCorto } from "./formato";

const MAX_ITEMS = 6;

type Props = { turnos: Turno[]; ahora: Date };

/**
 * Recordatorios automáticos por WhatsApp. Para que la lista sea corta mostramos los de
 * turnos agendados por el bot (enviados o no) y los próximos a enviarse del resto.
 * Primero los enviados más recientes, después los programados más próximos.
 */
export default function Recordatorios({ turnos, ahora }: Props) {
  const porId = new Map(turnos.map((t) => [t.id, t]));
  const todos = recordatoriosPara(turnos, clinica, ahora).filter(
    (r) => porId.get(r.turnoId)?.origen === "bot" || !r.enviado,
  );
  const enviados = todos.filter((r) => r.enviado).sort((a, b) => b.enviarEn.localeCompare(a.enviarEn));
  const programados = todos.filter((r) => !r.enviado).sort((a, b) => a.enviarEn.localeCompare(b.enviarEn));
  const lista = [...enviados, ...programados];
  const visibles = lista.slice(0, MAX_ITEMS);
  const resto = lista.length - visibles.length;

  if (lista.length === 0) {
    return <p className="text-[13px] text-slate-500">No hay recordatorios pendientes.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-slate-100">
        {visibles.map((r) => {
          const t = porId.get(r.turnoId)!;
          const bot = t.origen === "bot";
          return (
            <li key={`${r.turnoId}-${r.tipo}`} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
              <span
                className={`inline-flex w-[104px] shrink-0 items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${
                  r.enviado ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                <span aria-hidden>{r.enviado ? "✔" : "⏳"}</span> {r.enviado ? "enviado" : "programado"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-800">
                  {t.paciente}
                  <span className="font-normal text-slate-500"> · {tratamientoCorto(t.tratamientoId)}</span>
                  {bot && (
                    <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-px align-[1px] text-[10px] font-semibold text-amber-800">
                      ✨ por el asistente
                    </span>
                  )}
                </p>
                <p className="truncate text-[12px] text-slate-500">
                  Aviso {r.tipo === "24h" ? "24 h" : "2 h"} antes · {r.enviado ? "enviado" : "sale"}{" "}
                  {cuandoAmigable(new Date(r.enviarEn), ahora)}
                </p>
              </div>
            </li>
          );
        })}
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
