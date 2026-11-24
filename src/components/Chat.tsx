"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from "ai";
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { clinica } from "@/config/clinica";
import type { MensajeSistema } from "./Demo";

const MAX_CHARS = 500;
const TZ = "America/Argentina/Buenos_Aires";

export const SUGERENCIAS = [
  "¿Cuánto sale un blanqueamiento?",
  "Quiero un turno para limpieza",
  "¿Atienden OSDE?",
];

const ETIQUETA_HERRAMIENTA: Record<string, string> = {
  ver_disponibilidad: "Consultando agenda…",
  agendar_turno: "Reservando tu turno…",
  reprogramar_turno: "Reprogramando tu turno…",
  cancelar_turno: "Cancelando el turno…",
  ver_mis_turnos: "Buscando tus turnos…",
  derivar_a_humano: "Avisando al equipo…",
};

const fmtHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const hora = (iso: string | undefined) => (iso ? fmtHora.format(new Date(iso)) : "");

const variables = {
  "--primario": clinica.colorPrimario,
  "--primario-oscuro": `color-mix(in oklab, ${clinica.colorPrimario} 78%, black)`,
} as CSSProperties;

type Props = {
  className?: string;
  mensajesSistema: MensajeSistema[];
  /** `ahora` vigente de la demo (se envía al modelo en cada request). */
  obtenerAhora: () => Date;
  /** Reloj de la demo para sellar la hora de cada burbuja. */
  reloj: () => Date;
  /** Ejecuta una tool contra la agenda local y devuelve su output. */
  onHerramienta: (nombre: string, input: unknown) => unknown;
};

type Metadatos = { at?: string };

/** Una burbuja en pantalla. */
type Item =
  | { tipo: "msg"; key: string; propio: boolean; texto: string; at?: string; leido?: boolean; primero: boolean }
  | { tipo: "aviso"; key: string; variante: "sin_ia" | "error"; at?: string; primero: boolean };

export default function Chat({ className = "", mensajesSistema, obtenerAhora, reloj, onHerramienta }: Props) {
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ ahora: obtenerAhora().toISOString() }),
      }),
  );
  const [horas, setHoras] = useState<Record<string, string>>({});
  const [errorAt, setErrorAt] = useState<string>();
  const [texto, setTexto] = useState("");

  const { messages, sendMessage, status, error, addToolOutput } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall({ toolCall }) {
      if (toolCall.dynamic) return;
      const output = onHerramienta(toolCall.toolName, toolCall.input);
      // No se espera (await): el SDK lo indica así para evitar deadlocks.
      void addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output });
    },
    onFinish({ message }) {
      const at = reloj().toISOString();
      setHoras((h) => (h[message.id] ? h : { ...h, [message.id]: at }));
    },
    onError() {
      setErrorAt(reloj().toISOString());
    },
  });

  const ocupado = status === "submitted" || status === "streaming";
  const ultimo = messages.at(-1);
  const herramientaEnCurso =
    ocupado && ultimo?.role === "assistant" ? herramientaPendiente(ultimo) : undefined;
  const escribiendo =
    status === "submitted" ||
    (status === "streaming" && (ultimo?.role !== "assistant" || !terminaConTexto(ultimo)));

  const items = construirItems(messages, mensajesSistema, horas, error, errorAt);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [items.length, messages, escribiendo]);

  const enviar = (t: string) => {
    const limpio = t.trim().slice(0, MAX_CHARS);
    if (!limpio || ocupado) return;
    const metadata: Metadatos = { at: reloj().toISOString() };
    void sendMessage({ text: limpio, metadata });
    setTexto("");
  };

  return (
    <section
      style={variables}
      className={`flex h-full flex-col bg-[#efeae2] text-[#111b21] ${className}`}
      aria-label={`Chat con ${clinica.nombre}`}
    >
      <Encabezado escribiendo={escribiendo} />

      <div ref={scrollRef} className="fondo-chat relative flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-3xl flex-col px-3 py-3 sm:px-[6%] lg:px-10">
          <div className="mb-2 flex justify-center">
            <span className="rounded-lg bg-white/95 px-3 py-1 text-[12.5px] font-medium uppercase tracking-wide text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,.13)]">
              Hoy
            </span>
          </div>
          <p className="mx-auto mb-3 max-w-md rounded-lg bg-[#ffeecd] px-3 py-1.5 text-center text-[12.5px] leading-snug text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,.13)]">
            <IconoCandado /> Demo: responde un asistente con IA, como lo haría la recepción de la clínica.
            Los pacientes y turnos son ficticios.
          </p>

          {items.map((it) => (
            <Fragment key={it.key}>{it.tipo === "msg" ? <Burbuja item={it} /> : <Aviso item={it} />}</Fragment>
          ))}

          {escribiendo && <Escribiendo etiqueta={herramientaEnCurso && ETIQUETA_HERRAMIENTA[herramientaEnCurso]} />}
        </div>
      </div>

      {messages.length === 0 && (
        <div className="bg-[#efeae2]">
          <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-3 pb-2 pt-1 [scrollbar-width:none] sm:flex-wrap sm:justify-center">
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => enviar(s)}
                disabled={ocupado}
                className="shrink-0 rounded-full border border-(--primario)/30 bg-white px-3.5 py-1.5 text-[13.5px] font-medium text-(--primario-oscuro) shadow-[0_1px_0.5px_rgba(11,20,26,.13)] transition hover:bg-(--primario) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primario) active:scale-[.97] disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="bg-[#f0f2f5] px-2 py-2 sm:px-4"
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <div className="flex min-h-11 flex-1 items-end rounded-3xl bg-white px-4 py-2.5 shadow-[0_1px_0.5px_rgba(11,20,26,.08)]">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  enviar(texto);
                }
              }}
              disabled={ocupado}
              maxLength={MAX_CHARS}
              rows={1}
              placeholder={ocupado ? "Respondiendo…" : "Escribí un mensaje"}
              aria-label="Mensaje"
              className="max-h-32 w-full resize-none bg-transparent text-[15px] leading-6 text-[#111b21] outline-none [field-sizing:content] placeholder:text-[#8696a0] disabled:cursor-not-allowed"
            />
            {texto.length > MAX_CHARS - 100 && (
              <span className="ml-2 shrink-0 self-center text-[11px] tabular-nums text-[#8696a0]">
                {texto.length}/{MAX_CHARS}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={ocupado || !texto.trim()}
            aria-label="Enviar"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-(--primario) text-white shadow-sm transition hover:bg-(--primario-oscuro) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primario) active:scale-95 disabled:opacity-60"
          >
            <IconoEnviar />
          </button>
        </div>
      </form>
    </section>
  );
}

/* ---------- lógica de presentación ---------- */

function textoDeParte(p: UIMessage["parts"][number]): string | undefined {
  return p.type === "text" && p.text.trim() ? p.text : undefined;
}

function terminaConTexto(m: UIMessage): boolean {
  const p = m.parts.at(-1);
  return !!p && p.type === "text" && p.text.trim().length > 0;
}

function herramientaPendiente(m: UIMessage): string | undefined {
  for (const p of [...m.parts].reverse()) {
    if (p.type.startsWith("tool-") && "state" in p && (p.state === "input-streaming" || p.state === "input-available")) {
      return p.type.slice("tool-".length);
    }
  }
  return undefined;
}

function construirItems(
  messages: UIMessage[],
  sistema: MensajeSistema[],
  horas: Record<string, string>,
  error: Error | undefined,
  errorAt: string | undefined,
): Item[] {
  // 1) Burbujas del chat, en orden. Cada parte de texto del asistente es una burbuja.
  const chat: Item[] = [];
  let ultimaHora: string | undefined;
  messages.forEach((m, i) => {
    const propio = m.role === "user";
    const at = (propio ? (m.metadata as Metadatos | undefined)?.at : horas[m.id]) ?? ultimaHora;
    ultimaHora = at ?? ultimaHora;
    const leido = propio && messages.slice(i + 1).some((x) => x.role === "assistant");
    m.parts.forEach((p, j) => {
      const t = textoDeParte(p);
      if (t) chat.push({ tipo: "msg", key: `${m.id}-${j}`, propio, texto: t, at, leido, primero: false });
    });
  });
  if (error) {
    chat.push({
      tipo: "aviso",
      key: "error",
      variante: error.message.includes("sin_ia") ? "sin_ia" : "error",
      at: errorAt ?? ultimaHora,
      primero: false,
    });
  }

  // 2) Intercalar los mensajes locales (bienvenida, recordatorios) por hora.
  const locales: Item[] = [...sistema]
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((s) => ({ tipo: "msg", key: `sis-${s.id}`, propio: false, texto: s.texto, at: s.at, primero: false }));
  const out: Item[] = [];
  let k = 0;
  for (const it of chat) {
    while (k < locales.length && it.at && locales[k].at! <= it.at) out.push(locales[k++]);
    out.push(it);
  }
  while (k < locales.length) out.push(locales[k++]);

  // 3) La "colita" de la burbuja va sólo en la primera de cada grupo del mismo lado.
  let lado: boolean | undefined;
  for (const it of out) {
    const propio = it.tipo === "msg" && it.propio;
    it.primero = propio !== lado;
    lado = propio;
  }
  return out;
}

/** WhatsApp-style: *negrita* (y **negrita** de markdown) → <strong>. */
function conFormato(texto: string): ReactNode[] {
  const partes = texto.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  return partes.map((p, i) => {
    const m = /^\*\*([^*\n]+)\*\*$/.exec(p) ?? /^\*([^*\n]+)\*$/.exec(p);
    return m ? <strong key={i} className="font-semibold">{m[1]}</strong> : <Fragment key={i}>{p}</Fragment>;
  });
}

/* ---------- componentes visuales ---------- */

const SOMBRA = "shadow-[0_1px_0.5px_rgba(11,20,26,.13)]";

function Burbuja({ item }: { item: Extract<Item, { tipo: "msg" }> }) {
  const { propio, primero } = item;
  return (
    <div className={`flex ${propio ? "justify-end" : "justify-start"} ${primero ? "mt-2" : "mt-0.5"} animate-entrada`}>
      <div
        className={`relative max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-2.5 pb-2 pt-1.5 text-[14.5px] leading-[1.4] sm:max-w-[65%] ${SOMBRA} ${
          propio ? "bg-[#d9fdd3]" : "bg-white"
        } ${primero ? (propio ? "rounded-tr-none" : "rounded-tl-none") : ""}`}
      >
        {primero && <Colita propio={propio} />}
        {conFormato(item.texto)}
        {/* espaciador para que la hora no pise el texto */}
        <span aria-hidden className={`inline-block ${propio ? "w-[68px]" : "w-[46px]"}`} />
        <span className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[11px] leading-none text-[#667781]">
          {hora(item.at)}
          {propio && <Ticks leido={!!item.leido} />}
        </span>
      </div>
    </div>
  );
}

function Aviso({ item }: { item: Extract<Item, { tipo: "aviso" }> }) {
  const sinIa = item.variante === "sin_ia";
  return (
    <div className={`flex justify-start ${item.primero ? "mt-2" : "mt-0.5"} animate-entrada`} role="status">
      <div className={`relative max-w-[85%] rounded-lg bg-white px-2.5 pb-2 pt-1.5 text-[14.5px] leading-[1.4] sm:max-w-[65%] ${SOMBRA} ${item.primero ? "rounded-tl-none" : ""}`}>
        {item.primero && <Colita propio={false} />}
        <span className="mr-1.5 inline-flex size-5 translate-y-[3px] items-center justify-center rounded-full bg-amber-100 text-[12px]">
          {sinIa ? "🔌" : "⚠️"}
        </span>
        {sinIa ? "La demo no está conectada a la IA todavía" : "Uy, tuve un problema para responder. Probá de nuevo."}
        {sinIa ? (
          <span className="mt-0.5 block text-[12.5px] text-[#667781]">
            Falta configurar la clave de IA en el servidor. Todo lo demás está listo.
            <span aria-hidden className="inline-block w-[46px]" />
          </span>
        ) : (
          <span aria-hidden className="inline-block w-[46px]" />
        )}
        <span className="absolute bottom-1 right-2 text-[11px] leading-none text-[#667781]">{hora(item.at)}</span>
      </div>
    </div>
  );
}

function Escribiendo({ etiqueta }: { etiqueta?: string }) {
  return (
    <div className="mt-2 flex flex-col items-start gap-1 animate-entrada" aria-live="polite">
      <div className={`relative rounded-lg rounded-tl-none bg-white px-3.5 py-3 ${SOMBRA}`}>
        <Colita propio={false} />
        <span className="sr-only">{clinica.nombre} está escribiendo</span>
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 animate-punto rounded-full bg-[#8696a0]"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </span>
      </div>
      {etiqueta && <span className="pl-1 text-[12px] italic text-[#667781]">{etiqueta}</span>}
    </div>
  );
}

function Encabezado({ escribiendo }: { escribiendo: boolean }) {
  return (
    <header className="z-10 flex items-center gap-3 bg-(--primario-oscuro) px-3 py-2.5 text-white shadow-md sm:px-4">
      <IconoAtras />
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[22px] shadow-inner ring-2 ring-white/20">
        <span aria-hidden>{clinica.logoEmoji}</span>
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <h1 className="flex items-center gap-1 truncate text-[16px] font-semibold">
          <span className="truncate">{clinica.nombre}</span>
          <IconoVerificado />
        </h1>
        <p className="truncate text-[13px] text-white/80" aria-live="polite">
          {escribiendo ? <span className="font-medium text-white">escribiendo…</span> : "en línea"}
        </p>
      </div>
      <div className="flex items-center gap-5 pr-1 text-white/90" aria-hidden>
        <IconoTelefono />
        <IconoMenu />
      </div>
    </header>
  );
}

/** Esqueleto mientras se monta en el cliente. */
export function ChatCargando() {
  return (
    <main className="flex h-dvh w-full flex-col bg-[#efeae2]" style={variables} aria-busy>
      <div className="flex items-center gap-3 bg-(--primario-oscuro) px-4 py-2.5">
        <div className="size-10 rounded-full bg-white/90" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-44 rounded bg-white/40" />
          <div className="h-2.5 w-16 rounded bg-white/25" />
        </div>
      </div>
      <div className="fondo-chat flex-1" />
      <div className="h-[60px] bg-[#f0f2f5]" />
    </main>
  );
}

/* ---------- íconos ---------- */

function Colita({ propio }: { propio: boolean }) {
  return propio ? (
    <svg viewBox="0 0 8 13" className="absolute -right-2 top-0 h-[13px] w-2 text-[#d9fdd3]" aria-hidden>
      <path fill="currentColor" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
    </svg>
  ) : (
    <svg viewBox="0 0 8 13" className="absolute -left-2 top-0 h-[13px] w-2 text-white" aria-hidden>
      <path fill="currentColor" d="M2.812 1H8v11.193L1.533 3.568C.474 2.156 1.042 1 2.812 1z" />
    </svg>
  );
}

function Ticks({ leido }: { leido: boolean }) {
  return (
    <svg
      viewBox="0 0 16 11"
      className={`ml-0.5 h-[11px] w-4 ${leido ? "text-[#53bdeb]" : "text-[#8696a0]"}`}
      aria-label={leido ? "Leído" : "Entregado"}
      role="img"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1 6.2 3.9 9 10.4 1.6M6.6 8.6l.5.4 6.5-7.4"
      />
    </svg>
  );
}

function IconoEnviar() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px] translate-x-[1px]" aria-hidden>
      <path
        fill="currentColor"
        d="M3.4 20.4 20.85 12.92a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"
      />
    </svg>
  );
}

function IconoAtras() {
  return (
    <svg viewBox="0 0 24 24" className="-ml-1 size-6 shrink-0 text-white/90 sm:hidden" aria-hidden>
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function IconoVerificado() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-label="Cuenta de empresa verificada" role="img">
      <path
        fill="#25d366"
        d="m12 1.5 2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22.5l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z"
      />
      <path fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m8 12.2 2.7 2.6L16.2 9" />
    </svg>
  );
}

function IconoTelefono() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path
        fill="currentColor"
        d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 0 0-1.02.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"
      />
    </svg>
  );
}

function IconoMenu() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path
        fill="currentColor"
        d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
      />
    </svg>
  );
}

function IconoCandado() {
  return (
    <svg viewBox="0 0 24 24" className="mr-0.5 inline size-3 -translate-y-px" aria-hidden>
      <path
        fill="currentColor"
        d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z"
      />
    </svg>
  );
}
