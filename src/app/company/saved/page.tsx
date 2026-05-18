"use client";

import { useAppStore } from "@/hooks/useStore";
import { mockCandidates } from "@/data/mockCandidates";
import { Bookmark } from "lucide-react";
import Link from "next/link";

export default function CompanySavedPage() {
  const savedCandidateIds = useAppStore((s) => s.companySavedCandidates);
  const toggleSavedCandidate = useAppStore((s) => s.toggleCompanySavedCandidate);

  const savedCandidates = mockCandidates.filter((c) => savedCandidateIds.includes(c.id));

  return (
    <div className="px-4 py-6">
      <h1
        className="text-xl font-bold mb-4"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
      >
        Saved Candidates
      </h1>

      {savedCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bookmark size={48} style={{ color: "var(--text-dim)" }} className="mb-4" />
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            No saved candidates yet
          </p>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            Tap the Save button while browsing to bookmark candidates
          </p>
          <Link
            href="/company/swipe"
            className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
          >
            Start Browsing
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {savedCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {candidate.fullName}
                </h3>
                <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                  {candidate.headline} · {candidate.experienceLevel}
                </p>
              </div>
              <button
                onClick={() => toggleSavedCandidate(candidate.id)}
                className="ml-3 flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
                style={{
                  backgroundColor: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                }}
              >
                <Bookmark size={16} style={{ color: "var(--accent)" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}