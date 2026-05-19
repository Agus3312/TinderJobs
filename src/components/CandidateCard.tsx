"use client";

import { CandidateProfile } from "@/types/candidate";
import { TechPill } from "./TechPill";
import { ActionButtons } from "./ActionButtons";
import { MapPin, DollarSign, Briefcase } from "lucide-react";

interface CandidateCardProps {
  candidate: CandidateProfile;
  onReject?: () => void;
  onSave?: () => void;
  onConnect?: () => void;
  onTapDetail?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function computeMatchScore(id: string): number {
  // Deterministic pseudo-match-score for demo display
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 70 + (hash % 25); // range 70–94
}

function formatExperienceLevel(level: string): string {
  const map: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior",
    lead: "Lead",
    principal: "Principal",
  };
  return map[level] ?? level;
}

function formatRemotePref(pref: string): string {
  const map: Record<string, string> = {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
  };
  return map[pref] ?? pref;
}

function formatSalary(salary: string | undefined): string {
  if (!salary) return "";
  if (salary.includes("–") || salary.includes("-")) {
    const parts = salary.includes("–") ? salary.split("–") : salary.split("-");
    const min = parseInt(parts[0].replace(/\D/g, ""));
    const max = parseInt(parts[1].replace(/\D/g, ""));
    if (!isNaN(min) && !isNaN(max)) {
      return `$${min / 1000}k–$${max / 1000}k`;
    }
  }
  const num = parseInt(salary.replace(/\D/g, ""));
  if (!isNaN(num)) return `$${num / 1000}k`;
  return salary;
}

// ── Component ──────────────────────────────────────────────────────────────

export function CandidateCard({
  candidate,
  onReject,
  onSave,
  onConnect,
  onTapDetail,
}: CandidateCardProps) {
  const initials =
    candidate.avatarInitials || candidate.fullName.substring(0, 2).toUpperCase();
  const matchScore = computeMatchScore(candidate.id);

  return (
    <div
      className="w-[340px] sm:w-[360px] md:w-[380px] rounded-xl p-4 flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* ── Header: Avatar + Name + Headline + Match Score ── */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
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

          <div className="min-w-0">
            <h3
              className="text-sm font-medium truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {candidate.fullName}
            </h3>
            <p
              className="text-xs leading-snug line-clamp-1"
              style={{ color: "var(--text-dim)" }}
            >
              {candidate.headline}
            </p>
          </div>
        </div>

        {/* Match score badge */}
        <div
          className="flex-shrink-0 px-2.5 py-1 rounded-md ml-2"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            className="text-xs font-semibold tabular-nums"
            style={{
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {matchScore}%
          </span>
        </div>
      </div>

      {/* ── Location + Remote Preference ── */}
      <div
        className="flex items-center gap-1 text-sm mt-1"
        style={{ color: "var(--text-muted)" }}
      >
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{candidate.location}</span>
        <span style={{ color: "var(--text-dim)" }}>
          · {formatRemotePref(candidate.remotePreference)}
        </span>
      </div>

      {/* ── Experience Level ── */}
      <div className="flex items-center gap-1.5 text-sm mt-1.5">
        <Briefcase
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
        />
        <span style={{ color: "var(--text-secondary)" }}>
          {formatExperienceLevel(candidate.experienceLevel)}
        </span>
      </div>

      {/* ── Salary Expectation ── */}
      {candidate.salaryExpectation && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md mt-2"
          style={{
            backgroundColor: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
          }}
        >
          <DollarSign
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "var(--accent)" }}
          />
          <span
            className="text-sm font-semibold tabular-nums"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {formatSalary(candidate.salaryExpectation)}
          </span>
        </div>
      )}

      {/* ── Skills ── */}
      <div className="flex gap-1.5 overflow-x-auto mt-2.5 pb-0.5 scrollbar-hide">
        {candidate.skills.slice(0, 4).map((skill, index) => (
          <TechPill key={index} tech={skill} />
        ))}
        {candidate.skills.length > 4 && (
          <span
            className="text-[11px] flex-shrink-0 self-center"
            style={{ color: "var(--text-dim)" }}
          >
            +{candidate.skills.length - 4}
          </span>
        )}
      </div>

      {/* Tap hint */}
      <p className="text-[10px] text-center mt-1" style={{ color: "var(--text-dim)" }}>
        Tap for details
      </p>

      {/* ── Actions ── */}
      <div className="mt-auto pt-2">
        <ActionButtons
          onReject={onReject || (() => {})}
          onSave={onSave || (() => {})}
          onApply={onConnect || (() => {})}
          labels={{ reject: "Pass", save: "Save", apply: "Connect" }}
        />
      </div>
    </div>
  );
}

export default CandidateCard;
