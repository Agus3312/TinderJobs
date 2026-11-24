import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST } from "./route";

// Sólo casos que se rechazan antes de llamar al modelo: nunca sale a la red.
const ENV = "AI_GATEWAY_API_KEY";
let previa: string | undefined;
beforeAll(() => {
  previa = process.env[ENV];
  process.env[ENV] = "clave-de-prueba";
});
afterAll(() => {
  if (previa === undefined) delete process.env[ENV];
  else process.env[ENV] = previa;
});

const pedir = (body: unknown) =>
  POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const base = { messages: [], ahora: "2026-11-24T13:00:00Z" };

async function esperar400(body: unknown, error: string) {
  const r = await pedir(body);
  expect(r.status).toBe(400);
  expect(await r.json()).toEqual({ error });
}

describe("POST /api/chat: validación", () => {
  it("body que no es JSON u objeto", async () => {
    await esperar400("{no json", "body_invalido");
    await esperar400("null", "body_invalido");
  });

  it("messages y ahora", async () => {
    await esperar400({ ahora: base.ahora }, "messages_requerido");
    await esperar400({ messages: [], ahora: "ayer" }, "ahora_invalido");
  });

  it("avisos que no es un array", async () => {
    await esperar400({ ...base, avisos: "hola" }, "avisos_invalidos");
    await esperar400({ ...base, avisos: null }, "avisos_invalidos");
  });

  it("avisos con elementos que no son texto", async () => {
    await esperar400({ ...base, avisos: ["ok", 3] }, "avisos_invalidos");
  });

  it("más de 10 avisos", async () => {
    await esperar400({ ...base, avisos: Array.from({ length: 11 }, (_, i) => `aviso ${i}`) }, "avisos_invalidos");
  });

  it("un aviso de más de 500 caracteres", async () => {
    await esperar400({ ...base, avisos: ["x".repeat(501)] }, "avisos_invalidos");
  });

  it("sin clave de IA responde 503 sin_ia", async () => {
    const oidc = process.env.VERCEL_OIDC_TOKEN;
    delete process.env[ENV];
    delete process.env.VERCEL_OIDC_TOKEN;
    const r = await pedir({ ...base, avisos: ["x".repeat(501)] });
    process.env[ENV] = "clave-de-prueba";
    if (oidc !== undefined) process.env.VERCEL_OIDC_TOKEN = oidc;
    expect(r.status).toBe(503);
  });
});
