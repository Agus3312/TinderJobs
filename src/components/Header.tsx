"use client";

import { Zap } from "lucide-react";

interface HeaderProps {
  likedCount: number;
  matchScore?: number;
}

export function Header({ likedCount, matchScore }: HeaderProps) {
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

      {/* Match score */}
      {matchScore !== undefined && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ backgroundColor: "var(--bg-elevated)" }}>
          <Zap className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {matchScore}%
          </span>
        </div>
      )}

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