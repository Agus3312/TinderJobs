/**
 * Topes de la conversación que se manda a /api/chat. El servidor rechaza lo que se pasa (para
 * acotar el costo si alguien usa el link para otra cosa) y el cliente recorta antes, con margen,
 * para que una demo larga nunca choque contra esos topes.
 */
export const LIMITES = {
  /** Servidor: máximo de mensajes por request. */
  mensajes: 40,
  /** Servidor: máximo de caracteres de texto sumando todos los mensajes. */
  textoTotal: 20_000,
  /** Servidor: máximo del JSON de los mensajes (incluye herramientas). */
  jsonTotal: 100_000,
  /** Servidor y cliente: máximo de caracteres de cada mensaje del paciente. */
  mensajeUsuario: 500,
  /** Cliente: recorta a esta cantidad de mensajes. */
  mensajesCliente: 30,
  /** Cliente: recorta a este total de texto. */
  textoCliente: 15_000,
} as const;

export type ProblemaHistorial = "demasiados_mensajes" | "historial_largo" | "mensaje_largo";

type Parte = { type?: unknown; text?: unknown };
type Mensaje = { role?: unknown; parts?: unknown };

function textoDe(m: unknown): number {
  const parts = (m as Mensaje | null)?.parts;
  if (!Array.isArray(parts)) return 0;
  let n = 0;
  for (const p of parts as Parte[]) if (p && p.type === "text" && typeof p.text === "string") n += p.text.length;
  return n;
}

/** Código de error si `messages` se pasa de algún tope; `null` si está bien. No valida la forma. */
export function problemaDeHistorial(messages: unknown[]): ProblemaHistorial | null {
  if (messages.length > LIMITES.mensajes) return "demasiados_mensajes";
  let total = 0;
  for (const m of messages) total += textoDe(m);
  if (total > LIMITES.textoTotal || JSON.stringify(messages).length > LIMITES.jsonTotal) return "historial_largo";
  const usuario = messages.filter((m) => (m as Mensaje | null)?.role === "user");
  if (usuario.some((m) => textoDe(m) > LIMITES.mensajeUsuario)) return "mensaje_largo";
  return null;
}

/**
 * Lo que manda el cliente: los últimos turnos completos (siempre arranca en un mensaje del
 * paciente, así no quedan herramientas sin su llamada) dentro de los topes del cliente.
 */
export function recortarHistorial<T extends { role: string; parts: unknown }>(messages: T[]): T[] {
  let texto = 0;
  let desde = messages.length;
  for (let i = messages.length - 1; i >= 0; i--) {
    texto += textoDe(messages[i]);
    const cantidad = messages.length - i;
    if (cantidad > LIMITES.mensajesCliente || texto > LIMITES.textoCliente) break;
    if (messages[i].role === "user") desde = i;
  }
  if (desde === 0) return messages;
  if (desde === messages.length) {
    // Ni el último turno entra: mandamos al menos ese turno completo.
    const ultimo = messages.findLastIndex((m) => m.role === "user");
    return ultimo <= 0 ? messages : messages.slice(ultimo);
  }
  return messages.slice(desde);
}

/** ¿El error (o algo que envuelve) es de autenticación del AI Gateway? (sin clave ni OIDC válidos) */
export function esErrorDeAutenticacion(e: unknown, profundidad = 0): boolean {
  if (!e || typeof e !== "object" || profundidad > 4) return false;
  const err = e as { name?: unknown; cause?: unknown; lastError?: unknown };
  if (err.name === "GatewayAuthenticationError") return true;
  return esErrorDeAutenticacion(err.lastError, profundidad + 1) || esErrorDeAutenticacion(err.cause, profundidad + 1);
}
