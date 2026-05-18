"use client";

import type { Match } from "@/types/match";
import type { Role } from "@/types/user";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Briefcase, DollarSign } from "lucide-react";
import { TechPill } from "./TechPill";

interface MatchDetailProps {
  match: Match;
  role: Role;
  isOpen: boolean;
  onClose: () => void;
}

function formatExperienceLevel(level: string): string {
  const map: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior",
    lead: "Lead",
    principal: "Principal",
  };
  return map[level] || level;
}

export function MatchDetail({ match, role, isOpen, onClose }: MatchDetailProps) {
  // Determine opponent
  const opponent = role === "candidate" ? match.companySnapshot : match.candidateSnapshot;
  const jobTitle = match.jobSnapshot?.title;

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
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-xl"
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
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }} />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-4 w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "var(--bg-elevated)" }}
            >
              <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>

            <div className="px-5 pb-8">
              {/* Match header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  <span className="text-lg font-bold" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {role === "candidate"
                      ? match.companySnapshot.companyName.substring(0, 2).toUpperCase()
                      : match.candidateSnapshot.avatarInitials || match.candidateSnapshot.fullName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold truncate" style={{ color: "var(--text-primary)" }}>
                    {role === "candidate" ? match.companySnapshot.companyName : match.candidateSnapshot.fullName}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {role === "candidate" ? match.companySnapshot.industry : match.candidateSnapshot.headline}
                  </p>
                </div>
              </div>

              {/* Job title (for candidate matches) */}
              {jobTitle && (
                <div className="mb-4 px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
                  <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                    {jobTitle}
                  </span>
                </div>
              )}

              {/* Opponent details */}
              {role === "candidate" ? (
                // Company details
                <>
                  {match.companySnapshot.description && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
                        About the company
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {match.companySnapshot.description}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {match.companySnapshot.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} /> {match.companySnapshot.size}</span>
                    <span style={{ color: "var(--accent)" }}>{match.companySnapshot.remotePolicy}</span>
                  </div>
                </>
              ) : (
                // Candidate details
                <>
                  <div className="flex flex-wrap gap-3 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {match.candidateSnapshot.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} /> {formatExperienceLevel(match.candidateSnapshot.experienceLevel)}</span>
                    <span style={{ color: "var(--accent)" }}>{match.candidateSnapshot.remotePreference}</span>
                  </div>
                  {match.candidateSnapshot.salaryExpectation && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3" style={{ backgroundColor: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
                      <DollarSign size={14} style={{ color: "var(--accent)" }} />
                      <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        ${Math.floor(parseInt(match.candidateSnapshot.salaryExpectation) / 1000)}k
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {match.candidateSnapshot.skills.map((skill, i) => (
                        <TechPill key={i} tech={skill} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}