"use client";

import { Job } from "@/types/job";
import { X, MapPin, DollarSign, Briefcase, ArrowRight, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TechPill } from "./TechPill";

interface JobDetailModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReject: () => void;
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

export function JobDetailModal({ job, isOpen, onClose, onApply, onReject }: JobDetailModalProps) {
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
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }} />
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

              {/* Company header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {job.company.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {job.company}
                  </h3>
                  {job.companySize && (
                    <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                      {job.companySize}
                    </span>
                  )}
                </div>
                {job.matchScore && (
                  <div
                    className="flex-shrink-0 px-2.5 py-1 rounded-md"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                      {job.matchScore}%
                    </span>
                  </div>
                )}
              </div>

              {/* Job title */}
              <h2 className="text-xl font-bold leading-snug mb-2" style={{ color: "var(--text-primary)" }}>
                {job.title}
              </h2>

              {/* Location + Type + Remote */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.location}</span>
                </div>
                {job.jobType && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>
                      {job.jobType === "full-time" ? "Full-time" : job.jobType === "part-time" ? "Part-time" : job.jobType === "contract" ? "Contract" : "Internship"}
                    </span>
                  </div>
                )}
                {job.remote && (
                  <span style={{ color: "var(--accent)" }}>Remote</span>
                )}
              </div>

              {/* Salary */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-5"
                style={{
                  backgroundColor: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                }}
              >
                <DollarSign className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <span className="text-lg font-semibold tabular-nums" style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {formatSalary(job.salary)}
                </span>
                {job.remote && <span className="ml-auto text-sm" style={{ color: "var(--accent)" }}>Remote</span>}
              </div>

              {/* Divider */}
              <div className="h-px mb-5" style={{ backgroundColor: "var(--border)" }} />

              {/* Description */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
                  About the role
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {job.description}
                </p>
              </div>

              {/* Company description */}
              {job.companyDescription && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
                    About {job.company}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {job.companyDescription}
                  </p>
                </div>
              )}

              {/* Tech Stack */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.stack.map((tech, index) => (
                    <TechPill key={index} tech={tech} />
                  ))}
                </div>
              </div>

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
                    Benefits
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <ChevronUp className="w-3 h-3" style={{ color: "var(--accent)" }} />
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Match reasons */}
              {job.matchReasons && job.matchReasons.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
                    Why it matches you
                  </h4>
                  <div className="space-y-1.5">
                    {job.matchReasons.map((reason, index) => (
                      <div key={index} className="flex items-start gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { onClose(); onReject(); }}
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
                  onClick={() => { onClose(); onApply(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors duration-150 active:scale-95"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#000",
                  }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default JobDetailModal;