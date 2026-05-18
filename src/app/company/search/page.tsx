"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/hooks/useStore";
import { mockCandidates } from "@/data/mockCandidates";
import { Search, MapPin, Briefcase } from "lucide-react";
import type { CandidateProfile } from "@/types/candidate";

type RemoteFilter = "all" | "remote" | "hybrid" | "onsite";
type LevelFilter = "all" | "entry" | "mid" | "senior" | "lead" | "principal";

export default function CompanySearchPage() {
  const [query, setQuery] = useState("");
  const [remoteFilter, setRemoteFilter] = useState<RemoteFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");

  const filtered = useMemo(() => {
    return mockCandidates.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));
      const matchesRemote =
        remoteFilter === "all" || c.remotePreference === remoteFilter;
      const matchesLevel =
        levelFilter === "all" || c.experienceLevel === levelFilter;
      return matchesQuery && matchesRemote && matchesLevel;
    });
  }, [query, remoteFilter, levelFilter]);

  return (
    <div className="px-4 py-6">
      <h1
        className="text-xl font-bold mb-4"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
      >
        Search Candidates
      </h1>

      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-dim)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, headline, or skill..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <FilterPill label="All" active={remoteFilter === "all"} onClick={() => setRemoteFilter("all")} />
        <FilterPill label="Remote" active={remoteFilter === "remote"} onClick={() => setRemoteFilter("remote")} />
        <FilterPill label="Hybrid" active={remoteFilter === "hybrid"} onClick={() => setRemoteFilter("hybrid")} />
        <FilterPill label="On-site" active={remoteFilter === "onsite"} onClick={() => setRemoteFilter("onsite")} />
        <span style={{ width: 1, backgroundColor: "var(--border)" }} />
        <FilterPill label="All levels" active={levelFilter === "all"} onClick={() => setLevelFilter("all")} />
        <FilterPill label="Senior" active={levelFilter === "senior"} onClick={() => setLevelFilter("senior")} />
        <FilterPill label="Mid" active={levelFilter === "mid"} onClick={() => setLevelFilter("mid")} />
        <FilterPill label="Entry" active={levelFilter === "entry"} onClick={() => setLevelFilter("entry")} />
      </div>

      <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>
        {filtered.length} {filtered.length === 1 ? "candidate" : "candidates"}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Search size={48} style={{ color: "var(--text-dim)" }} className="mb-4" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No candidates match your search
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((candidate) => (
            <CandidateSearchCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-150"
      style={{
        backgroundColor: active ? "var(--accent-dim)" : "var(--bg-elevated)",
        border: `1px solid ${active ? "var(--accent-border)" : "var(--border)"}`,
        color: active ? "var(--accent)" : "var(--text-muted)",
      }}
    >
      {label}
    </button>
  )
}

function CandidateSearchCard({ candidate }: { candidate: CandidateProfile }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {candidate.fullName}
          </h3>
          <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
            {candidate.headline}
          </p>
        </div>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <span className="text-xs font-bold" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            {candidate.avatarInitials || candidate.fullName.substring(0, 2)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <MapPin size={12} /> {candidate.location}
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <Briefcase size={12} /> {candidate.experienceLevel}
        </span>
        <span className="text-xs" style={{ color: "var(--accent)" }}>
          {candidate.remotePreference}
        </span>
      </div>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {candidate.skills.slice(0, 4).map((skill, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded text-[11px] font-medium"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}