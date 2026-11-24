import { convertToModelMessages, isStepCount, streamText, type UIMessage } from "ai";
import { clinica } from "@/config/clinica";
import { construirPrompt } from "@/lib/prompt";
import { tools } from "@/lib/tools";

export const maxDuration = 30;

// Modelo vía AI Gateway; sobrescribible con AI_MODEL.
const MODELO = process.env.AI_MODEL ?? "anthropic/claude-sonnet-5.5";

const json = (body: unknown, status: number) =>
  Response.json(body, { status });

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return json({ error: "sin_ia" }, 503);
  }

  let body: { messages?: unknown; ahora?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "body_invalido" }, 400);
  }

  const { messages, ahora } = body;
  if (!Array.isArray(messages)) return json({ error: "messages_requerido" }, 400);
  const fecha = typeof ahora === "string" ? new Date(ahora) : null;
  if (!fecha || Number.isNaN(fecha.getTime())) return json({ error: "ahora_invalido" }, 400);

  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(messages as UIMessage[], { tools });
  } catch {
    return json({ error: "messages_invalidos" }, 400);
  }

  const result = streamText({
    model: MODELO,
    system: construirPrompt(clinica, fecha),
    messages: modelMessages,
    tools,
    stopWhen: isStepCount(5),
  });

  return result.toUIMessageStreamResponse({
    onError: (e) => {
      console.error("[chat]", e);
      return "ia_error";
    },
  });
}
