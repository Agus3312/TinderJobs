"use client";

import { useAppStore } from "@/hooks/useStore";
import { mockJobs } from "@/data/mockJobs";
import { Bookmark } from "lucide-react";
import Link from "next/link";

export default function CandidateSavedPage() {
  const savedJobIds = useAppStore((s) => s.candidateSavedJobs);
  const toggleSavedJob = useAppStore((s) => s.toggleCandidateSavedJob);

  const savedJobs = mockJobs.filter((job) => savedJobIds.includes(job.id));

  return (
    <div className="px-4 py-6">
      <h1
        className="text-xl font-bold mb-4"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
      >
        Saved Jobs
      </h1>

      {savedJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bookmark size={48} style={{ color: "var(--text-dim)" }} className="mb-4" />
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            No saved jobs yet
          </p>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            Tap the Save button while swiping to bookmark jobs
          </p>
          <Link
            href="/candidate/swipe"
            className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
          >
            Start Swiping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {savedJobs.map((job) => (
            <div
              key={job.id}
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
                  {job.title}
                </h3>
                <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                  {job.company} · {job.location}
                </p>
              </div>
              <button
                onClick={() => toggleSavedJob(job.id)}
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