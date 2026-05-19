"use client";

import { Job } from "@/types/job";
import { JobCardHeader } from "./JobCardHeader";
import { TechPill } from "./TechPill";
import { MatchReason } from "./MatchReason";
import { ActionButtons } from "./ActionButtons";
import { MapPin, DollarSign } from "lucide-react";

interface JobCardDisplayProps {
  job: Job;
  onReject?: () => void;
  onSave?: () => void;
  onApply?: () => void;
  onTapDetail?: () => void;
}

function formatSalary(salary: string): string {
  if (!salary) return "";
  if (salary.includes("-")) {
    const [min, max] = salary.split("-");
    return `$${parseInt(min) / 1000}k–$${parseInt(max) / 1000}k`;
  }
  const num = parseInt(salary);
  if (!isNaN(num)) return `$${num / 1000}k`;
  return salary;
}

export function JobCardDisplay({ job, onReject, onSave, onApply, onTapDetail }: JobCardDisplayProps) {
  return (
    <div
      className="w-[340px] sm:w-[360px] md:w-[380px] rounded-xl p-4 flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <JobCardHeader
        company={job.company}
        logo={job.logo}
        matchScore={job.matchScore || 0}
        posted={job.posted}
      />

      {/* Title */}
      <h2 className="text-base font-semibold leading-snug line-clamp-2" style={{ color: "var(--text-primary)" }}>
        {job.title}
      </h2>

      {/* Location */}
      <div className="flex items-center gap-1 text-sm mt-1" style={{ color: "var(--text-muted)" }}>
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{job.location}</span>
        {job.remote && <span style={{ color: "var(--text-dim)" }}>· Remote</span>}
        {job.jobType && (
          <span style={{ color: "var(--text-dim)" }}>
            · {job.jobType === "full-time" ? "FT" : job.jobType === "part-time" ? "PT" : job.jobType === "contract" ? "CTH" : "Int"}
          </span>
        )}
      </div>

      {/* Salary */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-md mt-2"
        style={{
          backgroundColor: "var(--accent-dim)",
          border: "1px solid var(--accent-border)",
        }}
      >
        <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
        <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
          {formatSalary(job.salary)}
        </span>
      </div>

      {/* Tech Stack */}
      <div className="flex gap-1.5 overflow-x-auto mt-2.5 pb-0.5 scrollbar-hide">
        {job.stack.slice(0, 4).map((tech, index) => (
          <TechPill key={index} tech={tech} />
        ))}
        {job.stack.length > 4 && (
          <span className="text-[11px] flex-shrink-0 self-center" style={{ color: "var(--text-dim)" }}>
            +{job.stack.length - 4}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed line-clamp-2 mt-2" style={{ color: "var(--text-secondary)" }}>
        {job.description}
      </p>

      {/* Match Reasons */}
      {job.matchReasons && job.matchReasons.length > 0 && (
        <MatchReason reasons={job.matchReasons} maxVisible={2} />
      )}

      {/* Tap hint */}
      <p className="text-[10px] text-center mt-1" style={{ color: "var(--text-dim)" }}>
        Tap for details
      </p>

      {/* Actions */}
      <div className="mt-auto pt-2">
        <ActionButtons
          onReject={onReject || (() => {})}
          onSave={onSave || (() => {})}
          onApply={onApply || (() => {})}
        />
      </div>
    </div>
  );
}

export default JobCardDisplay;