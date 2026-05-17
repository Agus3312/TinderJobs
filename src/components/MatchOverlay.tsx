"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/hooks/useStore";
import type { Match } from "@/types/match";

// ── Props ───────────────────────────────────────────────────────────────────

interface MatchOverlayProps {
  match: Match | null;
  onDismiss: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export function MatchOverlay({ match, onDismiss }: MatchOverlayProps) {
  const activeRole = useAppStore((s) => s.activeRole);

  // ── Determine opponent name based on active role ──────────────────────

  const opponentName =
    activeRole === "candidate"
      ? match?.companySnapshot.companyName ?? "Unknown"
      : match?.candidateSnapshot.fullName ?? "Unknown";

  // ── Auto-dismiss after 3 seconds ───────────────────────────────────────

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (!match) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [match, handleDismiss]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          key="match-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={handleDismiss}
        >
          {/* Card — stops click propagation so backdrop click works */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center text-center"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              backdropFilter: "blur(24px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ✓ Icon in emerald circle */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{
                backgroundColor: "var(--accent-dim)",
                border: "2px solid var(--accent)",
              }}
            >
              <span
                className="text-4xl leading-none"
                style={{ color: "var(--accent)" }}
              >
                ✓
              </span>
            </div>

            {/* Heading */}
            <h2
              className="text-2xl font-bold mb-2 tracking-tight"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              It&apos;s a Match!
            </h2>

            {/* Subtitle */}
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              You matched with{" "}
              <span
                className="font-semibold"
                style={{ color: "var(--accent)" }}
              >
                {opponentName}
              </span>
            </p>

            {/* Continue button */}
            <button
              onClick={handleDismiss}
              className="w-full max-w-[200px] py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 active:scale-95"
              style={{
                backgroundColor: "var(--accent)",
                color: "#000",
                fontFamily: "var(--font-mono)",
              }}
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MatchOverlay;
