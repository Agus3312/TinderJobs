"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JobCardDisplay } from "@/components/JobCardDisplay";
import { JobDetailModal } from "@/components/JobDetailModal";
import { Header } from "@/components/Header";
import { GlassNavbar } from "@/components/GlassNavbar";
import { mockJobs } from "@/data/mockJobs";

const STORAGE_KEYS = {
  likedJobs: "job-swipe-liked",
  passedJobs: "job-swipe-passed",
  currentIndex: "job-swipe-index",
};

export default function Home() {
  const [jobs] = useState(mockJobs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedJobs, setLikedJobs] = useState<number[]>([]);
  const [passedJobs, setPassedJobs] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedLiked = localStorage.getItem(STORAGE_KEYS.likedJobs);
    const storedPassed = localStorage.getItem(STORAGE_KEYS.passedJobs);
    const storedIndex = localStorage.getItem(STORAGE_KEYS.currentIndex);
    if (storedLiked) setLikedJobs(JSON.parse(storedLiked));
    if (storedPassed) setPassedJobs(JSON.parse(storedPassed));
    if (storedIndex) setCurrentIndex(parseInt(storedIndex, 10));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.likedJobs, JSON.stringify(likedJobs));
      localStorage.setItem(STORAGE_KEYS.passedJobs, JSON.stringify(passedJobs));
      localStorage.setItem(STORAGE_KEYS.currentIndex, currentIndex.toString());
    }
  }, [likedJobs, passedJobs, currentIndex, isLoaded]);

  const handleSwipe = useCallback(
    (dir: "left" | "right") => {
      if (isAnimating) return;
      const currentJob = jobs[currentIndex];
      if (!currentJob) return;

      setDirection(dir);
      setIsAnimating(true);

      if (dir === "right") {
        setLikedJobs((prev) => [...prev, currentJob.id]);
      } else {
        setPassedJobs((prev) => [...prev, currentJob.id]);
      }

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeProgress(0);
        setIsAnimating(false);
      }, 200);
    },
    [isAnimating, currentIndex, jobs]
  );

  const handleDragEnd = useCallback(
    (_: any, info: any) => {
      if (isAnimating) return;
      if (info.offset.x > 60 || info.velocity.x > 400) handleSwipe("right");
      else if (info.offset.x < -60 || info.velocity.x < -400) handleSwipe("left");
      else setSwipeProgress(0);
    },
    [isAnimating, handleSwipe]
  );

  const handleReset = () => {
    setCurrentIndex(0);
    setLikedJobs([]);
    setPassedJobs([]);
    localStorage.removeItem(STORAGE_KEYS.likedJobs);
    localStorage.removeItem(STORAGE_KEYS.passedJobs);
    localStorage.removeItem(STORAGE_KEYS.currentIndex);
  };

  const remainingJobs = jobs.length - currentIndex;
  const currentJob = currentIndex < jobs.length ? jobs[currentIndex] : null;

  return (
    <div className="relative min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <Header likedCount={likedJobs.length} matchScore={currentJob?.matchScore} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-16">
        <div className="relative">
          {/* Ghost card behind */}
          {currentJob && currentIndex + 1 < jobs.length && (
            <div
              className="absolute pointer-events-none"
              style={{
                transform: "scale(0.96) translateY(6px)",
                opacity: 0.3,
                zIndex: 0,
              }}
            >
              <div
                className="w-[340px] sm:w-[360px] md:w-[380px] rounded-xl"
                style={{
                  height: 440,
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentJob ? (
              <motion.div
                key={currentIndex}
                drag={isAnimating ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDrag={(_, info) => {
                  setSwipeProgress(Math.max(-1, Math.min(1, info.offset.x / 200)));
                }}
                onDragEnd={handleDragEnd}
                onDoubleClick={() => setShowDetail(true)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  x: direction === "right" ? 300 : -300,
                  opacity: 0,
                  transition: { duration: 0.18, ease: "easeOut" },
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="relative z-10 cursor-grab active:cursor-grabbing touch-none"
              >
                {/* NOPE overlay */}
                {swipeProgress < -0.15 && (
                  <div
                    className="absolute inset-0 z-20 pointer-events-none flex items-center justify-start pl-5 rounded-xl"
                    style={{
                      background: `linear-gradient(to right, rgba(239,68,68,${Math.min(0.15, Math.abs(swipeProgress) * 0.2)}), transparent 50%)`,
                    }}
                  />
                )}
                {/* LIKE overlay */}
                {swipeProgress > 0.15 && (
                  <div
                    className="absolute inset-0 z-20 pointer-events-none flex items-center justify-end pr-5 rounded-xl"
                    style={{
                      background: `linear-gradient(to left, rgba(16,185,129,${Math.min(0.15, swipeProgress * 0.2)}), transparent 50%)`,
                    }}
                  />
                )}

                <JobCardDisplay
                  job={currentJob}
                  onReject={() => handleSwipe("left")}
                  onSave={() => {}}
                  onApply={() => handleSwipe("right")}
                  onTapDetail={() => setShowDetail(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-[340px] sm:w-[360px] md:w-[380px] rounded-xl p-8 flex flex-col items-center justify-center text-center"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <span className="text-5xl mb-4">✓</span>
                <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  All done
                </h2>
                <p className="text-sm mb-6 max-w-[280px]" style={{ color: "var(--text-secondary)" }}>
                  You&apos;ve seen all available jobs. Come back later for new opportunities.
                </p>
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold tabular-nums" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                      {likedJobs.length}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>saved</span>
                  </div>
                  <div style={{ width: 1, height: 24, backgroundColor: "var(--border)" }} />
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold tabular-nums" style={{ color: "var(--danger)", fontFamily: "var(--font-mono)" }}>
                      {passedJobs.length}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>passed</span>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 active:scale-95"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#000",
                  }}
                >
                  Start Over
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {remainingJobs > 0 && currentIndex < jobs.length && (
          <p className="mt-4 text-xs font-medium" style={{ color: "var(--text-dim)" }}>
            {remainingJobs} {remainingJobs === 1 ? "offer" : "offers"} left
          </p>
        )}
      </main>

      <GlassNavbar activeTab="feed" />

      {currentJob && (
        <JobDetailModal
          job={currentJob}
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          onApply={() => handleSwipe("right")}
          onReject={() => handleSwipe("left")}
        />
      )}
    </div>
  );
}