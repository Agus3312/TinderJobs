"use client";

import { useEffect, useRef } from "react";
import { clinica } from "@/config/clinica";
import { diasDeAtencion, inicioDelDiaArt, type Turno } from "@/lib/agenda";
import { capitalizar, diaCorto, esEstetica, hora, mismoDia, tratamientoCorto } from "./formato";

type Props = {
  turnos: Turno[];
  /** Hora simulada vigente (para marcar "Hoy" y atenuar los turnos que ya pasaron). */
  ahora: Date;
};

/** Agenda de los próximos 5 días de atención, una columna por día. */
export default function Agenda({ turnos, ahora }: Props) {
  const dias = diasDeAtencion(ahora, clinica, 5);
  const porDia = new Map<number, Turno[]>(dias.map((d) => [d, []]));
  for (const t of turnos) {
    porDia.get(inicioDelDiaArt(new Date(t.inicio).getTime()))?.push(t);
  }
  for (const lista of porDia.values()) lista.sort((a, b) => a.inicio.localeCompare(b.inicio));

  // Al aparecer un turno nuevo del bot, lo traemos a la vista dentro del panel.
  const delBot = turnos.filter((t) => t.origen === "bot");
  const ultimoBot = delBot.at(-1)?.id;
  const vistos = useRef(new Set(delBot.map((t) => t.id)));
  useEffect(() => {
    if (!ultimoBot || vistos.current.has(ultimoBot)) return;
    vistos.current.add(ultimoBot);
    const el = document.querySelector(`[data-turno="${ultimoBot}"]`);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [ultimoBot]);

  const ahoraMs = ahora.getTime();

  return (
    <div className="@container">
      <ol className="grid grid-cols-1 gap-2.5 @xl:grid-cols-5 @xl:gap-2">
        {dias.map((d) => {
          const lista = porDia.get(d) ?? [];
          const esHoy = mismoDia(d, ahora);
          const activos = lista.filter((t) => t.estado !== "cancelado").length;
          return (
            <li
              key={d}
              className={`flex min-w-0 flex-col rounded-xl p-1.5 @xl:min-h-[220px] ${
                esHoy ? "bg-teal-50/80 ring-1 ring-teal-200/80" : "bg-slate-50 ring-1 ring-slate-200/60"
              }`}
            >
              <div className="flex items-baseline justify-between gap-1 px-1.5 pb-1.5 pt-0.5">
                <span className={`truncate text-[12.5px] font-semibold ${esHoy ? "text-teal-800" : "text-slate-700"}`}>
                  {esHoy ? "Hoy" : capitalizar(diaCorto(d))}
                  {esHoy && <span className="ml-1 font-normal text-teal-700/70">{diaCorto(d).split(" ")[1]}</span>}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                  {activos} {activos === 1 ? "turno" : "turnos"}
                </span>
              </div>
              {lista.length === 0 ? (
                <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300/80 px-2 py-3 text-center text-[11.5px] text-slate-400">
                  Sin turnos
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-1.5 @md:grid-cols-2 @xl:grid-cols-1">
                  {lista.map((t) => (
                    <BloqueTurno key={t.id} turno={t} pasado={new Date(t.inicio).getTime() < ahoraMs} />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** "Camila Rodríguez" -> "Camila R." (para columnas angostas). */
function nombreCorto(nombre: string): string {
  const [n, ...resto] = nombre.trim().split(/\s+/);
  const ap = resto.at(-1);
  return ap ? `${n} ${ap.charAt(0)}.` : n;
}

function BloqueTurno({ turno: t, pasado }: { turno: Turno; pasado: boolean }) {
  const cancelado = t.estado === "cancelado";
  const bot = t.origen === "bot";
  const estetica = esEstetica(t.tratamientoId);
  const borde = cancelado ? "border-l-slate-300" : estetica ? "border-l-rose-400" : "border-l-teal-500";
  const fondo = bot && !cancelado ? "bg-amber-50 ring-1 ring-amber-300/90" : "bg-white ring-1 ring-slate-200/80";

  return (
    <li
      data-turno={t.id}
      className={`relative min-w-0 rounded-lg border-l-[3px] px-2 py-1.5 shadow-[0_1px_1px_rgba(15,23,42,.04)] ${borde} ${fondo} ${
        bot && !cancelado ? "animate-nuevo" : ""
      } ${pasado && !bot ? "opacity-55" : ""}`}
      title={`${hora(t.inicio)} · ${tratamientoCorto(t.tratamientoId)} · ${t.paciente}${cancelado ? " (cancelado)" : ""}`}
    >
      {bot && !cancelado && (
        <span className="absolute -top-2 right-1 inline-flex items-center gap-0.5 rounded-full bg-amber-400 px-1.5 py-px text-[9.5px] font-bold uppercase leading-[14px] tracking-wide text-amber-950 shadow-sm ring-2 ring-white">
          <span aria-hidden>✨</span> nuevo
        </span>
      )}
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[12.5px] font-semibold tabular-nums ${cancelado ? "text-slate-400 line-through" : "text-slate-900"}`}>
          {hora(t.inicio)}
        </span>
        {cancelado && (
          <span className="min-w-0 truncate rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-500">
            cancelado
          </span>
        )}
      </div>
      <p
        className={`line-clamp-2 hyphens-auto text-[12px] leading-tight ${
          cancelado ? "text-slate-400 line-through" : estetica ? "text-rose-700" : "text-teal-800"
        }`}
      >
        {tratamientoCorto(t.tratamientoId)}
      </p>
      <p className={`truncate text-[11.5px] leading-tight ${cancelado ? "text-slate-400 line-through" : "text-slate-500"}`}>
        <span className="@xl:hidden">{t.paciente}</span>
        <span className="hidden @xl:inline">{nombreCorto(t.paciente)}</span>
      </p>
    </li>
  );
}
