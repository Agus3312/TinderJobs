import { describe, expect, it } from "vitest";
import { tools } from "./tools";

describe("tools", () => {
  it("expone las 6 herramientas, con inputSchema y sin execute", () => {
    expect(Object.keys(tools).sort()).toEqual(
      [
        "agendar_turno",
        "cancelar_turno",
        "derivar_a_humano",
        "reprogramar_turno",
        "ver_disponibilidad",
        "ver_mis_turnos",
      ].sort(),
    );
    for (const t of Object.values(tools)) {
      expect(t.inputSchema).toBeDefined();
      expect((t as { execute?: unknown }).execute).toBeUndefined();
    }
  });
});
