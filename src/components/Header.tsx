"use client";

import { Zap, Shuffle } from "lucide-react";
import type { Role } from "@/types/user";

interface HeaderProps {
  likedCount: number;
  matchScore?: number;
  activeRole?: Role;
  onSwitchRole?: () => void;
}

export function Header({ likedCount, matchScore, activeRole, onSwitchRole }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5"
      style={{
        height: 56,
        backgroundColor: "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <h1
        className="text-base font-bold tracking-tight"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
      >
        jobswipe
      </h1>

      {/* Center group: role switcher or match score */}
      <div className="flex items-center gap-2">
        {/* Role switcher pill — only when both roles are active */}
        {activeRole && onSwitchRole && (
          <button
            onClick={onSwitchRole}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 active:scale-95"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <Shuffle className="w-3 h-3" />
            <span>
              {activeRole === "candidate" ? "Candidate" : "Company"}
            </span>
          </button>
        )}

        {/* Match score */}
        {matchScore !== undefined && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <Zap className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {matchScore}%
            </span>
          </div>
        )}
      </div>

      {/* Liked count */}
      <span
        className="text-sm tabular-nums"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
      >
        {likedCount} saved
      </span>
    </header>
  );
}

export default Header;