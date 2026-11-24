import { describe, expect, it } from "vitest";
import { LIMITES, esErrorDeAutenticacion, problemaDeHistorial, recortarHistorial } from "./limitesChat";

type M = { id: string; role: "user" | "assistant"; parts: { type: string; text?: string }[] };
const msg = (role: M["role"], text: string, i = 0): M => ({ id: `${role}-${i}`, role, parts: [{ type: "text", text }] });
const conversacion = (turnos: number, largo = 10): M[] =>
  Array.from({ length: turnos }, (_, i) => [msg("user", "u".repeat(largo), i), msg("assistant", "a".repeat(largo), i)]).flat();

describe("problemaDeHistorial", () => {
  it("una conversación normal no tiene problema", () => {
    expect(problemaDeHistorial(conversacion(5))).toBeNull();
    expect(problemaDeHistorial([])).toBeNull();
  });

  it("más de 40 mensajes", () => {
    expect(problemaDeHistorial(conversacion(21))).toBe("demasiados_mensajes");
    expect(problemaDeHistorial(conversacion(20))).toBeNull();
  });

  it("más de 20.000 caracteres de texto en total", () => {
    expect(problemaDeHistorial(conversacion(5, 2100))).toBe("historial_largo");
  });

  it("partes que no son texto también cuentan (JSON total)", () => {
    const enorme = [{ id: "a", role: "assistant", parts: [{ type: "tool-x", output: "x".repeat(LIMITES.jsonTotal) }] }];
    expect(problemaDeHistorial(enorme)).toBe("historial_largo");
  });

  it("algún mensaje del usuario de más de 500 caracteres", () => {
    expect(problemaDeHistorial([msg("user", "x".repeat(501))])).toBe("mensaje_largo");
    expect(problemaDeHistorial([msg("user", "x".repeat(501)), msg("assistant", "ok"), msg("user", "hola")])).toBe("mensaje_largo");
    expect(problemaDeHistorial([msg("user", "x".repeat(500))])).toBeNull();
  });

  it("tolera basura (la valida después convertToModelMessages)", () => {
    expect(problemaDeHistorial([null, 3, { parts: "no" }])).toBeNull();
  });
});

describe("recortarHistorial", () => {
  it("si entra en los límites, no cambia nada", () => {
    const c = conversacion(5);
    expect(recortarHistorial(c)).toBe(c);
  });

  it("conversación larga: se queda con los últimos turnos completos y arranca en un mensaje del usuario", () => {
    const c = conversacion(30);
    const r = recortarHistorial(c);
    expect(r.length).toBeLessThanOrEqual(LIMITES.mensajesCliente);
    expect(r[0].role).toBe("user");
    expect(r.at(-1)).toBe(c.at(-1));
    expect(problemaDeHistorial(r)).toBeNull();
  });

  it("recorta también por largo de texto", () => {
    const c = Array.from({ length: 12 }, (_, i) => [msg("user", "hola", i), msg("assistant", "a".repeat(2000), i)]).flat();
    expect(problemaDeHistorial(c)).toBe("historial_largo");
    const r = recortarHistorial(c);
    expect(r[0].role).toBe("user");
    expect(problemaDeHistorial(r)).toBeNull();
    expect(r.length).toBeLessThan(24);
  });

  it("aunque el último turno solo sea grande, nunca lo saca", () => {
    const c = [msg("user", "hola"), msg("assistant", "x".repeat(30_000))];
    expect(recortarHistorial(c)).toEqual(c);
  });
});

describe("esErrorDeAutenticacion", () => {
  const conNombre = (name: string, extra: object = {}) => Object.assign(new Error("x"), { name }, extra);

  it("detecta el error de autenticación del AI Gateway, directo o envuelto", () => {
    expect(esErrorDeAutenticacion(conNombre("GatewayAuthenticationError"))).toBe(true);
    expect(esErrorDeAutenticacion(conNombre("AI_RetryError", { lastError: conNombre("GatewayAuthenticationError") }))).toBe(true);
    expect(esErrorDeAutenticacion(conNombre("Otro", { cause: conNombre("GatewayAuthenticationError") }))).toBe(true);
  });

  it("detecta la cuenta sin tarjeta cargada (customer_verification_required)", () => {
    const sinTarjeta = conNombre("GatewayInternalServerError", {
      cause: conNombre("AI_APICallError", { responseBody: '{"error":{"type":"customer_verification_required"}}' }),
    });
    expect(esErrorDeAutenticacion(sinTarjeta)).toBe(true);
    expect(esErrorDeAutenticacion(Object.assign(new Error("AI Gateway requires a valid credit card on file"), { name: "X" }))).toBe(true);
  });

  it("otros errores no", () => {
    expect(esErrorDeAutenticacion(conNombre("GatewayRateLimitError"))).toBe(false);
    expect(esErrorDeAutenticacion("ups")).toBe(false);
    expect(esErrorDeAutenticacion(undefined)).toBe(false);
  });
});
