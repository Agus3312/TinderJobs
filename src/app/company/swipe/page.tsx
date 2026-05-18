"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/hooks/useStore";
import { mockCandidates } from "@/data/mockCandidates";
import { SwipeableCardFeed } from "@/components/SwipeableCardFeed";
import { CandidateCard } from "@/components/CandidateCard";
import { CandidateDetailModal } from "@/components/CandidateDetailModal";
import { MatchOverlay } from "@/components/MatchOverlay";
import type { CandidateProfile } from "@/types/candidate";
import type { Match } from "@/types/match";

export default function CompanySwipePage() {
  const companySwipeIndex = useAppStore((s) => s.companySwipeIndex);
  const companyLikedCandidates = useAppStore((s) => s.companyLikedCandidates);
  const companyPassedCandidates = useAppStore((s) => s.companyPassedCandidates);
  const companySwipeCandidate = useAppStore((s) => s.companySwipeCandidate);
  const resetCompanySwipes = useAppStore((s) => s.resetCompanySwipes);
  const toggleCompanySavedCandidate = useAppStore((s) => s.toggleCompanySavedCandidate);
  const matches = useAppStore((s) => s.matches);

  // ── Match overlay detection ────────────────────────────────────────────

  const prevMatchCount = useRef(matches.length);
  const [matchToShow, setMatchToShow] = useState<Match | null>(null);

  useEffect(() => {
    if (matches.length > prevMatchCount.current) {
      // New match created — show overlay with the most recent match
      const newMatch = matches[matches.length - 1];
      setMatchToShow(newMatch);
    }
    prevMatchCount.current = matches.length;
  }, [matches]);

  // ── Swipe handlers ─────────────────────────────────────────────────────

  const handleSwipe = useCallback(
    (candidate: CandidateProfile, direction: "left" | "right") => {
      companySwipeCandidate(candidate.id, direction);
    },
    [companySwipeCandidate],
  );

  const handleReset = useCallback(() => {
    resetCompanySwipes();
  }, [resetCompanySwipes]);

  const renderCard = useCallback(
    (candidate: CandidateProfile) => (
      <CandidateCard
        candidate={candidate}
        onReject={() => handleSwipe(candidate, "left")}
        onSave={() => toggleCompanySavedCandidate(candidate.id)}
        onConnect={() => handleSwipe(candidate, "right")}
        onTapDetail={() => {}}
      />
    ),
    [handleSwipe],
  );

  const renderDetail = useCallback(
    (
      candidate: CandidateProfile,
      isOpen: boolean,
      onClose: () => void,
      onApply: () => void,
      onReject: () => void,
    ) => (
      <CandidateDetailModal
        candidate={candidate}
        isOpen={isOpen}
        onClose={onClose}
        onConnect={onApply}
        onReject={onReject}
      />
    ),
    [],
  );

  return (
    <>
      <SwipeableCardFeed<CandidateProfile>
        items={mockCandidates}
        currentIndex={companySwipeIndex}
        onSwipe={handleSwipe}
        onReset={handleReset}
        renderCard={renderCard}
        renderDetail={renderDetail}
        likedCount={companyLikedCandidates.length}
        passedCount={companyPassedCandidates.length}
        remainingLabel="candidates left"
      />

      <MatchOverlay
        match={matchToShow}
        onDismiss={() => setMatchToShow(null)}
      />
    </>
  );
}
