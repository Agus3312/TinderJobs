"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/hooks/useStore";
import { mockJobs } from "@/data/mockJobs";
import { Search, MapPin, Briefcase, DollarSign } from "lucide-react";
import type { Job } from "@/types/job";

type RemoteFilter = "all" | "remote" | "hybrid" | "onsite";
type LevelFilter = "all" | "entry" | "mid" | "senior" | "lead" | "principal";

export default function CandidateSearchPage() {
  const [query, setQuery] = useState("");
  const [remoteFilter, setRemoteFilter] = useState<RemoteFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");

  const filtered = useMemo(() => {
    return mockJobs.filter((job) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.stack.some((s) => s.toLowerCase().includes(q));
      const matchesRemote =
        remoteFilter === "all" ||
        (remoteFilter === "remote" && job.remote) ||
        (remoteFilter === "onsite" && !job.remote);
      const matchesLevel =
        levelFilter === "all" || job.experienceLevel === levelFilter;
      return matchesQuery && matchesRemote && matchesLevel;
    });
  }, [query, remoteFilter, levelFilter]);

  return (
    <div className="px-4 py-6">
      <h1
        className="text-xl font-bold mb-4"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
      >
        Search Jobs
      </h1>

      {/* Search input */}
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-dim)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, company, or skill..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <FilterPill
          label="All"
          active={remoteFilter === "all"}
          onClick={() => setRemoteFilter("all")}
        />
        <FilterPill
          label="Remote"
          active={remoteFilter === "remote"}
          onClick={() => setRemoteFilter("remote")}
        />
        <FilterPill
          label="On-site"
          active={remoteFilter === "onsite"}
          onClick={() => setRemoteFilter("onsite")}
        />
        <span style={{ width: 1, backgroundColor: "var(--border)" }} />
        <FilterPill
          label="All levels"
          active={levelFilter === "all"}
          onClick={() => setLevelFilter("all")}
        />
        <FilterPill
          label="Senior"
          active={levelFilter === "senior"}
          onClick={() => setLevelFilter("senior")}
        />
        <FilterPill
          label="Mid"
          active={levelFilter === "mid"}
          onClick={() => setLevelFilter("mid")}
        />
        <FilterPill
          label="Entry"
          active={levelFilter === "entry"}
          onClick={() => setLevelFilter("entry")}
        />
      </div>

      {/* Results */}
      <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>
        {filtered.length} {filtered.length === 1 ? "result" : "results"}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Search size={48} style={{ color: "var(--text-dim)" }} className="mb-4" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No jobs match your search
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((job) => (
            <JobSearchCard key={job.id} job={job} />
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

function JobSearchCard({ job }: { job: Job }) {
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
            {job.title}
          </h3>
          <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
            {job.company}
          </p>
        </div>
        {job.matchScore && (
          <span
            className="text-xs font-semibold tabular-nums flex-shrink-0 px-2 py-0.5 rounded"
            style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            {job.matchScore}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <MapPin size={12} /> {job.location}
        </span>
        {job.remote && (
          <span className="text-xs" style={{ color: "var(--accent)" }}>Remote</span>
        )}
        {job.experienceLevel && (
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Briefcase size={12} /> {job.experienceLevel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <DollarSign size={14} style={{ color: "var(--accent)" }} />
        <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
          ${Math.floor(parseInt(job.salary.split("-")[0]) / 1000)}k
          {job.salary.includes("-") && `–$${Math.floor(parseInt(job.salary.split("-")[1]) / 1000)}k`}
        </span>
      </div>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {job.stack.slice(0, 4).map((tech, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded text-[11px] font-medium"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
          >
            {tech}
          </span>
        ))}
        {job.stack.length > 4 && (
          <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>
            +{job.stack.length - 4}
          </span>
        )}
      </div>
    </div>
  );
}