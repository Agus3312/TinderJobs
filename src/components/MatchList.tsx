"use client";

import { useAppStore } from "@/hooks/useStore";
import { MatchCard } from "./MatchCard";
import type { Role } from "@/types/user";

interface MatchListProps {
  role: Role;
}

export function MatchList({ role }: MatchListProps) {
  const matches = useAppStore((s) => s.getMatchesForRole(role));

  // ── Empty state ───────────────────────────────────────────────────────
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <p
          className="text-lg font-semibold mb-2"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          No matches yet
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Keep swiping to find your next match
        </p>
        <button
          onClick={() => {
            window.location.href = `/${role}/swipe`;
          }}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 active:scale-95"
          style={{
            backgroundColor: "var(--accent)",
            color: "#000",
            fontFamily: "var(--font-mono)",
          }}
        >
          Start swiping
        </button>
      </div>
    );
  }

  // ── Match list ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col px-4 py-6 gap-4">
      {/* Match count heading */}
      <h2
        className="text-lg font-bold tracking-tight mb-1 tabular-nums"
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {matches.length} Match{matches.length !== 1 ? "es" : ""}
      </h2>

      {/* Match cards */}
      <div className="flex flex-col gap-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            role={role}
            onTap={() => {
              // MVP: tap does nothing for now
              console.log("Match tapped:", match.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default MatchList;
