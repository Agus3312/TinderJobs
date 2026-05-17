"use client";

import { CandidateProfile } from "@/types/candidate";
import { X, MapPin, Briefcase, DollarSign, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TechPill } from "./TechPill";

interface CandidateDetailModalProps {
  candidate: CandidateProfile;
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  onReject: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function computeMatchScore(id: string): number {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 70 + (hash % 25);
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

function generateMatchReasons(candidate: CandidateProfile): string[] {
  const reasons: string[] = [];

  if (candidate.skills.length > 0) {
    reasons.push(
      `Strong background in ${candidate.skills.slice(0, 2).join(" & ")}`,
    );
  }

  if (candidate.remotePreference === "remote") {
    reasons.push("Open to remote work — location-flexible");
  } else if (candidate.remotePreference === "hybrid") {
    reasons.push("Available for hybrid on-site collaboration");
  }

  if (candidate.experienceLevel === "senior" || candidate.experienceLevel === "lead" || candidate.experienceLevel === "principal") {
    reasons.push("Senior-level experience brings depth to the team");
  } else if (candidate.experienceLevel === "mid") {
    reasons.push("Mid-level experience — strong independent contributor");
  }

  return reasons.slice(0, 3);
}

// ── Component ──────────────────────────────────────────────────────────────

export function CandidateDetailModal({
  candidate,
  isOpen,
  onClose,
  onConnect,
  onReject,
}: CandidateDetailModalProps) {
  const initials =
    candidate.avatarInitials || candidate.fullName.substring(0, 2).toUpperCase();
  const matchScore = computeMatchScore(candidate.id);
  const matchReasons = generateMatchReasons(candidate);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderTop: "1px solid var(--border)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1.5">
              <div
                className="w-8 h-1 rounded-full"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              />
            </div>

            {/* Content */}
            <div className="px-5 pb-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-4 w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              >
                <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              </button>

              {/* ── Candidate header ── */}
              <div className="flex items-center gap-3 mb-4">
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
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-base font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {candidate.fullName}
                  </h3>
                  <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                    {formatExperienceLevel(candidate.experienceLevel)}
                  </span>
                </div>
                <div
                  className="flex-shrink-0 px-2.5 py-1 rounded-md"
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

              {/* ── Headline ── */}
              <h2
                className="text-xl font-bold leading-snug mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {candidate.headline}
              </h2>

              {/* ── Location + Experience + Remote ── */}
              <div
                className="flex flex-wrap items-center gap-3 text-sm mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{candidate.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{formatExperienceLevel(candidate.experienceLevel)}</span>
                </div>
                <span style={{ color: "var(--accent)" }}>
                  {formatRemotePref(candidate.remotePreference)}
                </span>
              </div>

              {/* ── Salary ── */}
              {candidate.salaryExpectation && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-5"
                  style={{
                    backgroundColor: "var(--accent-dim)",
                    border: "1px solid var(--accent-border)",
                  }}
                >
                  <DollarSign
                    className="w-4 h-4"
                    style={{ color: "var(--accent)" }}
                  />
                  <span
                    className="text-lg font-semibold tabular-nums"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatSalary(candidate.salaryExpectation)}
                  </span>
                  <span
                    className="ml-auto text-sm"
                    style={{ color: "var(--accent)" }}
                  >
                    {formatRemotePref(candidate.remotePreference)}
                  </span>
                </div>
              )}

              {/* ── Divider ── */}
              <div
                className="h-px mb-5"
                style={{ backgroundColor: "var(--border)" }}
              />

              {/* ── Skills ── */}
              <div className="mb-5">
                <h4
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-dim)" }}
                >
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill, index) => (
                    <TechPill key={index} tech={skill} />
                  ))}
                </div>
              </div>

              {/* ── Match reasons ── */}
              {matchReasons.length > 0 && (
                <div className="mb-6">
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Why they match you
                  </h4>
                  <div className="space-y-1.5">
                    {matchReasons.map((reason, index) => (
                      <div key={index} className="flex items-start gap-1.5">
                        <ArrowRight
                          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                          style={{ color: "var(--accent)" }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Actions ── */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onReject();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-150 active:scale-95"
                  style={{
                    backgroundColor: "var(--danger-dim)",
                    border: "1px solid var(--danger-border)",
                    color: "var(--danger)",
                  }}
                >
                  <X className="w-4 h-4" />
                  Pass
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onConnect();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors duration-150 active:scale-95"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#000",
                  }}
                >
                  Connect
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CandidateDetailModal;
