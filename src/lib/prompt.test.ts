import { describe, it, expect } from "vitest";
import { construirPrompt, formatearPrecio } from "./prompt";
import { clinica } from "@/config/clinica";

// martes 24 de noviembre de 2026, 10:30 hora Argentina (13:30 UTC)
const ahora = new Date("2026-11-24T13:30:00Z");

describe("formatearPrecio", () => {
  it("formatea con separador de miles es-AR", () => {
    expect(formatearPrecio(45000)).toBe("$ 45.000");
    expect(formatearPrecio(180000)).toBe("$ 180.000");
    expect(formatearPrecio(950)).toBe("$ 950");
  });
});

describe("construirPrompt", () => {
  const p = construirPrompt(clinica, ahora);

  it("incluye datos de la clínica", () => {
    expect(p).toContain(clinica.nombre);
    expect(p).toContain(clinica.direccion);
    for (const os of clinica.obrasSociales) expect(p).toContain(os);
  });

  it("incluye cada tratamiento con precio formateado", () => {
    for (const t of clinica.tratamientos) {
      expect(p).toContain(t.nombre);
      expect(p).toContain(formatearPrecio(t.precio));
    }
    expect(p).toContain("$ 45.000");
  });

  it("incluye horario", () => {
    expect(p).toContain("lunes a viernes de 09:00 a 19:00");
    expect(p).toContain("sábados de 09:00 a 13:00");
    expect(p).toContain("de 2026");
    expect(p).toContain("derivá con derivar_a_humano");
    expect(p).toContain("ver_mis_turnos con el nombre");
    expect(p).toMatch(/09:00/);
    expect(p).toMatch(/19:00/);
    expect(p).toMatch(/13:00/);
  });

  it("incluye la fecha virtual en texto", () => {
    expect(p).toContain("martes 24 de noviembre");
  });

  it("usa la zona horaria de Argentina para la fecha", () => {
    // 01:00 UTC del 25 es todavía el 24 en Argentina
    const q = construirPrompt(clinica, new Date("2026-11-25T01:00:00Z"));
    expect(q).toContain("martes 24 de noviembre");
  });

  it("incluye frases literales y herramientas", () => {
    expect(p).toContain("Nunca des diagnósticos ni consejos médicos");
    expect(p).toContain("usá la herramienta derivar_a_humano");
    for (const h of ["ver_disponibilidad", "agendar_turno", "reprogramar_turno", "cancelar_turno", "ver_mis_turnos"])
      expect(p).toContain(h);
  });
});

describe("construirPrompt con avisos", () => {
  const aviso = "Hola Ana 👋 te recordamos tu turno de Limpieza dental mañana 16:30 en *Sonrisa Dental & Estética*. Respondé *SÍ* para confirmar.";

  it("sin avisos no agrega la sección", () => {
    expect(construirPrompt(clinica, ahora)).not.toContain("Mensajes automáticos");
    expect(construirPrompt(clinica, ahora, [])).not.toContain("Mensajes automáticos");
    expect(construirPrompt(clinica, ahora, ["  "])).not.toContain("Mensajes automáticos");
  });

  it("con avisos los lista y explica cómo responder SÍ o reprogramar", () => {
    const p = construirPrompt(clinica, ahora, [aviso]);
    expect(p).toContain("Mensajes automáticos que ya le mandaste al paciente:");
    expect(p).toContain(aviso);
    expect(p).toMatch(/SÍ/);
    expect(p).toMatch(/confirm/i);
    expect(p).toContain("reprogramar_turno");
    // la sección va al final, después de las reglas
    expect(p.indexOf("Mensajes automáticos")).toBeGreaterThan(p.indexOf("# Reglas importantes"));
  });

  it("aplana los saltos de línea de cada aviso", () => {
    const p = construirPrompt(clinica, ahora, ["línea uno\nlínea dos"]);
    expect(p).toContain('- "línea uno línea dos"');
  });
});
