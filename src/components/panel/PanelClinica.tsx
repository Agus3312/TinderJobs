"use client";

import { useEffect, useState, type ReactNode } from "react";
import { clinica } from "@/config/clinica";
import type { Turno } from "@/lib/agenda";
import Agenda from "./Agenda";
import Metricas from "./Metricas";
import Recordatorios, { Derivaciones } from "./Recordatorios";
import { capitalizar, diaLargo, hora } from "./formato";

type Props = {
  className?: string;
  turnos: Turno[];
  /** `ahora` fijado de la demo (cambia con "Simular día siguiente"). */
  ahora: Date;
  /** Reloj de la demo: `ahora` + el tiempo real transcurrido. */
  reloj: () => Date;
  derivaciones: string[];
  /** Recordatorios de turnos del bot que se mandaron: clave -> hora de envío. */
  enviados: Record<string, string>;
  /** Avanza al próximo día de atención; devuelve cuántos recordatorios se enviaron. */
  onSimularDia: () => number;
};

type Toast = { id: number; texto: string };

export default function PanelClinica({ className = "", turnos, ahora, reloj, derivaciones, enviados, onSimularDia }: Props) {
  // Hora simulada "en vivo" (avanza con el tiempo real; se recalcula al cambiar `ahora`).
  const [vivo, setVivo] = useState(() => reloj());
  useEffect(() => {
    const tic = () => setVivo(reloj());
    const t = setTimeout(tic, 0);
    const id = setInterval(tic, 15_000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, [reloj, ahora]);

  const [toast, setToast] = useState<Toast>();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(undefined), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const simular = () => {
    const n = onSimularDia();
    const texto =
      n === 0
        ? "Avanzamos al próximo día de atención."
        : `Se ${n === 1 ? "envió 1 recordatorio" : `enviaron ${n} recordatorios`} por WhatsApp 📲`;
    setToast({ id: Date.now(), texto });
  };

  const turnosDelBot = turnos.filter((t) => t.origen === "bot" && t.estado !== "cancelado").length;

  return (
    <aside
      aria-label="Panel de la clínica"
      className={`flex h-full flex-col overflow-hidden border-l border-slate-200 bg-slate-100/80 text-slate-900 ${className}`}
    >
      <header className="z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          <div className="min-w-[250px] flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-teal-700">Panel de la clínica</p>
            <h2 className="flex items-center gap-1.5 truncate text-[17px] font-bold leading-tight">
              <span aria-hidden>{clinica.logoEmoji}</span>
              <span className="truncate">{clinica.nombre}</span>
            </h2>
            <p key={ahora.getTime()} className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-slate-600 animate-entrada">
              <IconoReloj />
              <span className="whitespace-nowrap">
                <span className="font-medium text-slate-800">{capitalizar(diaLargo(vivo))}</span> ·{" "}
                <span className="tabular-nums">{hora(vivo)}</span>
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-px text-[10.5px] font-medium text-slate-500">hora simulada</span>
            </p>
          </div>
          <button
            type="button"
            onClick={simular}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[.97]"
          >
            Simular día siguiente <span aria-hidden>⏭</span>
          </button>
        </div>
        <div aria-live="polite" className="empty:hidden">
          {toast && (
            <p
              key={toast.id}
              className="mt-2.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[12.5px] font-medium text-emerald-800 ring-1 ring-emerald-200 animate-entrada"
            >
              {toast.texto}
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 lg:p-4">
        <Seccion
          titulo="Agenda"
          extra={
            <span className="flex items-center gap-3 text-[11.5px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-teal-500" aria-hidden /> Odontología
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-rose-400" aria-hidden /> Estética
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-amber-400" aria-hidden /> Asistente
              </span>
            </span>
          }
        >
          <Agenda turnos={turnos} ahora={vivo} />
        </Seccion>

        <Seccion titulo="Recordatorios automáticos" subtitulo="Por WhatsApp, 24 h y 2 h antes de cada turno">
          <Recordatorios turnos={turnos} ahora={vivo} enviados={enviados} />
        </Seccion>

        <Seccion
          titulo="Derivaciones a una persona"
          subtitulo="Urgencias, quejas o pedidos que el asistente le pasa al equipo"
          extra={
            derivaciones.length > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-px text-[11px] font-bold text-white tabular-nums">
                {derivaciones.length}
              </span>
            )
          }
        >
          <Derivaciones derivaciones={derivaciones} />
        </Seccion>

        <Seccion
          titulo="Resultados"
          extra={
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
              datos de ejemplo
            </span>
          }
        >
          <Metricas turnosDelBot={turnosDelBot} />
        </Seccion>
      </div>
    </aside>
  );
}

function Seccion({
  titulo,
  subtitulo,
  extra,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,.06)] ring-1 ring-slate-200/70 lg:p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <h3 className="text-[14.5px] font-semibold text-slate-900">{titulo}</h3>
          {subtitulo && <p className="text-[12px] text-slate-500">{subtitulo}</p>}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}

function IconoReloj() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 text-slate-400" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
