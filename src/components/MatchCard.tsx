"use client";

import type { Match } from "@/types/match";
import type { Role } from "@/types/user";

interface MatchCardProps {
  match: Match;
  role: Role;
  onTap?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "??";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return "just now";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;

  return new Date(isoString).toLocaleDateString();
}

// ── Component ──────────────────────────────────────────────────────────────

export function MatchCard({ match, role, onTap }: MatchCardProps) {
  // ── Determine opponent info based on role ─────────────────────────────
  const opponentName =
    role === "candidate"
      ? match.companySnapshot.companyName
      : match.candidateSnapshot.fullName;

  const opponentRoleInfo =
    role === "candidate"
      ? match.companySnapshot.industry
      : match.candidateSnapshot.headline;

  const initials =
    role === "candidate"
      ? getInitials(match.companySnapshot.companyName)
      : match.candidateSnapshot.avatarInitials ||
        getInitials(match.candidateSnapshot.fullName);

  const relativeTime = formatRelativeTime(match.createdAt);

  const jobTitle = match.jobSnapshot?.title;

  return (
    <button
      onClick={() => onTap?.()}
      className="w-full text-left rounded-xl p-4 transition-colors duration-150 active:scale-[0.98]"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar initials */}
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            className="text-sm font-bold"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {initials}
          </span>
        </div>

        {/* Name + role info */}
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {opponentName}
          </h3>
          <p
            className="text-xs line-clamp-1"
            style={{ color: "var(--text-muted)" }}
          >
            {opponentRoleInfo}
          </p>
          {jobTitle && (
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--accent)" }}
            >
              {jobTitle}
            </p>
          )}
        </div>

        {/* Match date */}
        <span
          className="text-xs flex-shrink-0 tabular-nums"
          style={{
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {relativeTime}
        </span>
      </div>
    </button>
  );
}

export default MatchCard;
