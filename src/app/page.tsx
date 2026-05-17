"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JobCardDisplay } from "@/components/JobCardDisplay";
import { JobDetailModal } from "@/components/JobDetailModal";
import { Header } from "@/components/Header";
import { GlassNavbar } from "@/components/GlassNavbar";
import { BackgroundGlow } from "@/components/BackgroundGlow";
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

  // Load localStorage
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

  // Save localStorage
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

      // Wait for exit animation, then show next card
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeProgress(0);
        setIsAnimating(false);
      }, 300);
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

  // Swipe overlay intensities
  const nopeOpacity = Math.max(0, Math.min(0.5, Math.abs(Math.min(0, swipeProgress)) * 0.5));
  const likeOpacity = Math.max(0, Math.min(0.5, Math.max(0, swipeProgress) * 0.5));

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] flex flex-col overflow-hidden">
      <BackgroundGlow />
      <Header likedCount={likedJobs.length} matchScore={currentJob?.matchScore} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-28">
        <div className="relative">
          {/* Ghost card behind */}
          {currentJob && currentIndex + 1 < jobs.length && (
            <div
              className="absolute pointer-events-none"
              style={{
                transform: "scale(0.95) translateY(8px)",
                opacity: 0.5,
                zIndex: 0,
              }}
            >
              <div
                className="w-[360px] sm:w-[380px] md:w-[400px] rounded-[28px] h-[460px]"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
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
                dragElastic={0.9}
                onDrag={(_, info) => {
                  setSwipeProgress(Math.max(-1, Math.min(1, info.offset.x / 200)));
                }}
                onDragEnd={handleDragEnd}
                onDoubleClick={() => setShowDetail(true)}
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{
                  x: direction === "right" ? 400 : -400,
                  rotate: direction === "right" ? 15 : -15,
                  opacity: 0,
                  transition: { duration: 0.25, ease: "easeOut" },
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative z-10 cursor-grab active:cursor-grabbing touch-none"
              >
                {/* NOPE overlay */}
                {swipeProgress < -0.1 && (
                  <div
                    className="absolute inset-0 z-20 pointer-events-none flex items-center justify-start pl-6 rounded-[28px]"
                    style={{
                      background: `linear-gradient(to right, rgba(239,68,68,${nopeOpacity}), transparent 60%)`,
                    }}
                  >
                    <span
                      className="text-2xl font-bold text-red-500 border-4 border-red-500 rounded-lg px-4 py-1"
                      style={{ transform: "rotate(-12deg)" }}
                    >
                      NOPE
                    </span>
                  </div>
                )}
                {/* LIKE overlay */}
                {swipeProgress > 0.1 && (
                  <div
                    className="absolute inset-0 z-20 pointer-events-none flex items-center justify-end pr-6 rounded-[28px]"
                    style={{
                      background: `linear-gradient(to left, rgba(16,185,129,${likeOpacity}), transparent 60%)`,
                    }}
                  >
                    <span
                      className="text-2xl font-bold text-emerald-500 border-4 border-emerald-500 rounded-lg px-4 py-1"
                      style={{ transform: "rotate(12deg)" }}
                    >
                      LIKE
                    </span>
                  </div>
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-[360px] sm:w-[380px] md:w-[400px] rounded-[28px] p-8 flex flex-col items-center justify-center text-center"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 0 40px -10px rgba(139, 92, 246, 0.4)",
                }}
              >
                <div className="relative mb-6">
                  <div
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)" }}
                  />
                  <span className="relative text-6xl">🎉</span>
                </div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{
                    background: "linear-gradient(to right, #8B5CF6, #6366F1, #3B82F6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  You&apos;re all caught up!
                </h2>
                <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8 max-w-[280px]">
                  You&apos;ve seen all available jobs. Come back later for new opportunities.
                </p>
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-[#10B981]">{likedJobs.length}</span>
                    <span className="text-xs text-[#71717A]">Liked</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-[#EF4444]">{passedJobs.length}</span>
                    <span className="text-xs text-[#71717A]">Passed</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-[#8B5CF6]">{likedJobs.length + passedJobs.length}</span>
                    <span className="text-xs text-[#71717A]">Total</span>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-8 py-3 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                    boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  Start Over
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {remainingJobs > 0 && currentIndex < jobs.length && (
          <p className="mt-6 text-sm text-[#71717A] font-medium">
            {remainingJobs} {remainingJobs === 1 ? "offer" : "offers"} available
          </p>
        )}
      </main>

      <GlassNavbar activeTab="feed" />

      {/* Job Detail Modal */}
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