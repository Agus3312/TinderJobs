"use client";

import { Job } from "@/types/job";
import { JobCardHeader } from "./JobCardHeader";
import { TechPill } from "./TechPill";
import { MatchReason } from "./MatchReason";
import { ActionButtons } from "./ActionButtons";
import { MapPin, DollarSign, ChevronUp } from "lucide-react";

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
    return `$${parseInt(min) / 1000}k - $${parseInt(max) / 1000}k`;
  }
  const num = parseInt(salary);
  if (!isNaN(num)) return `$${num / 1000}k`;
  return salary;
}

export function JobCardDisplay({ job, onReject, onSave, onApply, onTapDetail }: JobCardDisplayProps) {
  return (
    <div
      className="w-[360px] sm:w-[380px] md:w-[400px] rounded-[28px] p-5 flex flex-col overflow-hidden glass-fallback"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05), 0 0 40px -10px rgba(139,92,246,0.4)",
      }}
    >
      {/* Header: Company + AI match */}
      <JobCardHeader
        company={job.company}
        logo={job.logo}
        matchScore={job.matchScore || 0}
        posted={job.posted}
      />

      {/* Job Title */}
      <h2 className="text-lg font-bold text-white leading-snug mt-2 line-clamp-2">
        {job.title}
      </h2>

      {/* Location */}
      <div className="flex items-center gap-1 text-sm text-[#A1A1AA] mt-1">
        <MapPin className="w-3.5 h-3.5 text-[#71717A] flex-shrink-0" />
        <span className="truncate">{job.location}</span>
        {job.remote && <span className="text-[#71717A]">· Remote</span>}
        {job.jobType && <span className="text-[#71717A]">· {job.jobType === "full-time" ? "FT" : job.jobType === "part-time" ? "PT" : job.jobType === "contract" ? "CTH" : "Int"}</span>}
      </div>

      {/* Salary */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg mt-2"
        style={{
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
        }}
      >
        <DollarSign className="w-4 h-4 text-[#10B981] flex-shrink-0" />
        <span className="text-base font-semibold text-white">{formatSalary(job.salary)}</span>
      </div>

      {/* Tech Stack Pills */}
      <div className="flex gap-1.5 overflow-x-auto mt-2 pb-1 scrollbar-hide">
        {job.stack.slice(0, 4).map((tech, index) => (
          <TechPill key={index} tech={tech} />
        ))}
        {job.stack.length > 4 && (
          <span className="text-xs text-[#71717A] flex-shrink-0 self-center">+{job.stack.length - 4}</span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-2 mt-2">
        {job.description}
      </p>

      {/* Match Reasons */}
      {job.matchReasons && job.matchReasons.length > 0 && (
        <MatchReason reasons={job.matchReasons} maxVisible={2} />
      )}

      {/* Tap for detail hint */}
      {onTapDetail && (
        <button
          onClick={(e) => { e.stopPropagation(); onTapDetail(); }}
          className="flex items-center justify-center gap-1 w-full py-1.5 text-[#71717A] hover:text-white transition-colors text-xs"
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span>Tap for details</span>
        </button>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-1">
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