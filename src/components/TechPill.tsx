"use client";

export function TechPill({ tech }: { tech: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap"
      style={{
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
      }}
    >
      {tech}
    </span>
  );
}

export default TechPill;