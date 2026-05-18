"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────

interface SwipeableCardFeedProps<T> {
  /** Array of items to swipe through */
  items: T[];
  /** Current index in the items array (managed externally, e.g., by Zustand) */
  currentIndex: number;
  /** Called when user swipes or presses a button. The parent should extract the ID from the item and update the store. */
  onSwipe: (item: T, direction: "left" | "right") => void;
  /** Called when user taps "Start Over" on the end screen */
  onReset: () => void;
  /** Renders the card content. Receives the current item. */
  renderCard: (item: T) => React.ReactNode;
  /** Optional: renders a detail modal. Receives item, open state, and callbacks. */
  renderDetail?: (
    item: T,
    isOpen: boolean,
    onClose: () => void,
    onApply: () => void,
    onReject: () => void,
  ) => React.ReactNode;
  /** Count of liked items (shown on end screen) */
  likedCount: number;
  /** Count of passed items (shown on end screen) */
  passedCount: number;
  /** Label for remaining items counter, e.g. "offers left" or "candidates left" */
  remainingLabel: string;
  /** Current role — used for "All done" navigation links */
  role: "candidate" | "company";
}

// ── Component ──────────────────────────────────────────────────────────────

export function SwipeableCardFeed<T>({
  items,
  currentIndex,
  onSwipe,
  onReset,
  renderCard,
  renderDetail,
  likedCount,
  passedCount,
  remainingLabel,
  role,
}: SwipeableCardFeedProps<T>) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [showDetail, setShowDetail] = useState(false);

  const remaining = items.length - currentIndex;
  const currentItem = currentIndex < items.length ? items[currentIndex] : null;

  // ── Swipe handler ────────────────────────────────────────────────────

  const handleSwipe = useCallback(
    (dir: "left" | "right") => {
      if (isAnimating) return;
      if (!currentItem) return;

      setDirection(dir);
      setIsAnimating(true);

      // Delay the store update until AFTER the exit animation completes.
      // This prevents AnimatePresence from swapping the key prematurely,
      // which caused the card to visually fly in the wrong direction.
      const item = currentItem;
      setTimeout(() => {
        onSwipe(item, dir);
        setSwipeProgress(0);
        setIsAnimating(false);
      }, 200);
    },
    [isAnimating, currentItem, onSwipe],
  );

  // ── Drag-end handler ──────────────────────────────────────────────────

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
      if (isAnimating) return;
      if (info.offset.x > 60 || info.velocity.x > 400) {
        handleSwipe("right");
      } else if (info.offset.x < -60 || info.velocity.x < -400) {
        handleSwipe("left");
      } else {
        setSwipeProgress(0);
      }
    },
    [isAnimating, handleSwipe],
  );

  // ── Detail modal helpers ──────────────────────────────────────────────

  const handleCloseDetail = useCallback(() => setShowDetail(false), []);
  const handleDetailApply = useCallback(() => {
    setShowDetail(false);
    handleSwipe("right");
  }, [handleSwipe]);
  const handleDetailReject = useCallback(() => {
    setShowDetail(false);
    handleSwipe("left");
  }, [handleSwipe]);

  // ── Overlay intensity ─────────────────────────────────────────────────

  const nopeOpacity = Math.min(0.15, Math.abs(swipeProgress) * 0.2);
  const likeOpacity = Math.min(0.15, Math.max(0, swipeProgress) * 0.2);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="relative">
        {/* Ghost card behind — shows the NEXT card with reduced opacity */}
        {currentItem && currentIndex + 1 < items.length && (
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
          {currentItem ? (
            <motion.div
              key={currentIndex}
              // Disable drag while animating to prevent double-swipes
              drag={isAnimating ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDrag={(_, info) => {
                setSwipeProgress(
                  Math.max(-1, Math.min(1, info.offset.x / 200)),
                );
              }}
              onDragEnd={handleDragEnd}
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
              {/* NOPE overlay — left swipe (red gradient) */}
              {swipeProgress < -0.15 && (
                <div
                  className="absolute inset-0 z-20 pointer-events-none rounded-xl"
                  style={{
                    background: `linear-gradient(to right, rgba(239,68,68,${nopeOpacity}), transparent 50%)`,
                  }}
                />
              )}

              {/* LIKE overlay — right swipe (green gradient) */}
              {swipeProgress > 0.15 && (
                <div
                  className="absolute inset-0 z-20 pointer-events-none rounded-xl"
                  style={{
                    background: `linear-gradient(to left, rgba(16,185,129,${likeOpacity}), transparent 50%)`,
                  }}
                />
              )}

              {renderCard(currentItem)}
            </motion.div>
          ) : (
            // ── End state: all items swiped ────────────────────────────
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
              <span
                className="text-5xl mb-4"
                style={{ color: "var(--accent)" }}
              >
                ✓
              </span>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                All done
              </h2>
              <p
                className="text-sm mb-4 max-w-[280px]"
                style={{ color: "var(--text-secondary)" }}
              >
                You&apos;ve seen all available {role === "candidate" ? "offers" : "candidates"}.
                Check your matches or start over.
              </p>

              {/* Liked / Passed counts */}
              <div className="flex items-center gap-6 mb-5">
                <div className="flex flex-col items-center">
                  <span
                    className="text-xl font-bold tabular-nums"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {likedCount}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--text-dim)" }}
                  >
                    liked
                  </span>
                </div>
                <div
                  style={{
                    width: 1,
                    height: 24,
                    backgroundColor: "var(--border)",
                  }}
                />
                <div className="flex flex-col items-center">
                  <span
                    className="text-xl font-bold tabular-nums"
                    style={{
                      color: "var(--danger)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {passedCount}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--text-dim)" }}
                  >
                    passed
                  </span>
                </div>
              </div>

              {/* Navigation links */}
              <div className="flex flex-col gap-2 w-full max-w-[240px] mb-4">
                <a
                  href={`/${role}/matches`}
                  className="block w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-center transition-colors duration-150"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#000",
                  }}
                >
                  View Matches
                </a>
                <a
                  href={`/${role}/saved`}
                  className="block w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-center transition-colors duration-150"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  Saved {role === "candidate" ? "Jobs" : "Candidates"}
                </a>
              </div>

              <button
                onClick={onReset}
                className="text-xs font-medium"
                style={{ color: "var(--text-dim)" }}
              >
                Start Over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Remaining items counter */}
      {remaining > 0 && currentIndex < items.length && (
        <p
          className="mt-4 text-xs font-medium"
          style={{ color: "var(--text-dim)" }}
        >
          {remaining} {remainingLabel}
        </p>
      )}

      {/* Detail Modal */}
      {currentItem &&
        renderDetail &&
        renderDetail(
          currentItem,
          showDetail,
          handleCloseDetail,
          handleDetailApply,
          handleDetailReject,
        )}
    </div>
  );
}

export default SwipeableCardFeed;
