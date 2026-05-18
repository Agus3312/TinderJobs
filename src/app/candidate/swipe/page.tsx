"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/hooks/useStore";
import { mockJobs } from "@/data/mockJobs";
import { SwipeableCardFeed } from "@/components/SwipeableCardFeed";
import { JobCardDisplay } from "@/components/JobCardDisplay";
import { JobDetailModal } from "@/components/JobDetailModal";
import { MatchOverlay } from "@/components/MatchOverlay";
import type { Job } from "@/types/job";
import type { Match } from "@/types/match";

export default function CandidateSwipePage() {
  const candidateSwipeIndex = useAppStore((s) => s.candidateSwipeIndex);
  const candidateLikedJobs = useAppStore((s) => s.candidateLikedJobs);
  const candidatePassedJobs = useAppStore((s) => s.candidatePassedJobs);
  const candidateSwipeJob = useAppStore((s) => s.candidateSwipeJob);
  const resetCandidateSwipes = useAppStore((s) => s.resetCandidateSwipes);
  const toggleCandidateSavedJob = useAppStore((s) => s.toggleCandidateSavedJob);
  const matches = useAppStore((s) => s.matches);

  // ── Match overlay detection ────────────────────────────────────────────

  const prevMatchCount = useRef(matches.length);
  const [matchToShow, setMatchToShow] = useState<Match | null>(null);

  useEffect(() => {
    if (matches.length > prevMatchCount.current) {
      const newMatch = matches[matches.length - 1];
      setMatchToShow(newMatch);
    }
    prevMatchCount.current = matches.length;
  }, [matches]);

  // ── Swipe handlers ─────────────────────────────────────────────────────

  const handleSwipe = useCallback(
    (job: Job, direction: "left" | "right") => {
      candidateSwipeJob(job.id, direction);
    },
    [candidateSwipeJob]
  );

  const handleReset = useCallback(() => {
    resetCandidateSwipes();
  }, [resetCandidateSwipes]);

  const renderCard = useCallback(
    (job: Job) => (
      <JobCardDisplay
        job={job}
        onReject={() => handleSwipe(job, "left")}
        onSave={() => toggleCandidateSavedJob(job.id)}
        onApply={() => handleSwipe(job, "right")}
        onTapDetail={() => {}}
      />
    ),
    [handleSwipe, toggleCandidateSavedJob]
  );

  const renderDetail = useCallback(
    (
      job: Job,
      isOpen: boolean,
      onClose: () => void,
      onApply: () => void,
      onReject: () => void
    ) => (
      <JobDetailModal
        job={job}
        isOpen={isOpen}
        onClose={onClose}
        onApply={onApply}
        onReject={onReject}
      />
    ),
    []
  );

  return (
    <>
      <SwipeableCardFeed<Job>
        items={mockJobs}
        currentIndex={candidateSwipeIndex}
        onSwipe={handleSwipe}
        onReset={handleReset}
        renderCard={renderCard}
        renderDetail={renderDetail}
        likedCount={candidateLikedJobs.length}
        passedCount={candidatePassedJobs.length}
        remainingLabel="offers left"
      />

      <MatchOverlay
        match={matchToShow}
        onDismiss={() => setMatchToShow(null)}
      />
    </>
  );
}