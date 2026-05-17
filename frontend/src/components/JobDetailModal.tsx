"use client";

import { Job } from "@/types/job";
import { X, MapPin, DollarSign, Briefcase, Building2, Users, Sparkles, Check, ChevronUp } from "lucide-react";
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
    return `$${parseInt(min) / 1000}k - $${parseInt(max) / 1000}k`;
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl"
            style={{
              backgroundColor: "rgba(26, 26, 36, 0.98)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderBottom: "none",
              boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.5)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Content */}
            <div className="px-6 pb-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-[#A1A1AA]" />
              </button>

              {/* Company header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">
                    {job.company.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-white truncate">{job.company}</h3>
                  {job.companySize && (
                    <div className="flex items-center gap-1 text-xs text-[#71717A]">
                      <Users className="w-3 h-3" />
                      <span>{job.companySize} employees</span>
                    </div>
                  )}
                </div>
                {/* AI score badge */}
                {job.matchScore && (
                  <div
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-sm font-bold">{job.matchScore}%</span>
                  </div>
                )}
              </div>

              {/* Job title */}
              <h2 className="text-2xl font-bold text-white leading-snug mb-2">{job.title}</h2>

              {/* Location + Type + Remote */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#A1A1AA] mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#71717A]" />
                  <span>{job.location}</span>
                </div>
                {job.jobType && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#71717A]" />
                    <span>
                      {job.jobType === "full-time" ? "Full-time" : job.jobType === "part-time" ? "Part-time" : job.jobType === "contract" ? "Contract" : "Internship"}
                    </span>
                  </div>
                )}
                {job.remote && (
                  <div className="flex items-center gap-1 text-[#10B981]">
                    <span>Remote</span>
                  </div>
                )}
              </div>

              {/* Salary */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                <DollarSign className="w-5 h-5 text-[#10B981]" />
                <span className="text-xl font-semibold text-white">{formatSalary(job.salary)}</span>
                {job.remote && <span className="ml-auto text-sm text-[#10B981]">Remote</span>}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/5 mb-5" />

              {/* Full description */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-white mb-2">About the role</h4>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{job.description}</p>
              </div>

              {/* Company description */}
              {job.companyDescription && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#8B5CF6]" />
                    About {job.company}
                  </h4>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{job.companyDescription}</p>
                </div>
              )}

              {/* Tech Stack */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-white mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {job.stack.map((tech, index) => (
                    <TechPill key={index} tech={tech} />
                  ))}
                </div>
              </div>

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-white mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-[#A1A1AA]"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <Check className="w-3 h-3 text-[#10B981]" />
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Match reasons */}
              {job.matchReasons && job.matchReasons.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    Why it matches you
                  </h4>
                  <div className="space-y-2">
                    {job.matchReasons.map((reason, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#A1A1AA]">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => { onClose(); onReject(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-4 h-4 text-[#EF4444]" />
                  <span className="text-sm font-medium text-[#EF4444]">Pass</span>
                </motion.button>

                <motion.button
                  onClick={() => { onClose(); onApply(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)",
                    boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                  }}
                  whileHover={{ scale: 1.02, boxShadow: "0 6px 25px rgba(139, 92, 246, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm font-semibold text-white">Apply Now</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default JobDetailModal;