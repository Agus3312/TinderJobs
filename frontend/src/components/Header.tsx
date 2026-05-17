"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  /** Number of likes — displayed as streak count */
  likedCount: number;
  /** AI match score (0–100) for the insights badge */
  matchScore?: number;
}

/**
 * Header — Premium glassmorphism top bar.
 *
 * Layout (fixed 64px):
 *   Logo (gradient text) | Streak (🔥 + count) | AI Insights (sparkles + match%)
 *
 * Props:
 *   - likedCount: displayed as the "day streak" number
 *   - matchScore: displayed next to the sparkles icon as "XX% match"
 */
export function Header({ likedCount, matchScore }: HeaderProps) {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 glass-fallback"
      style={{
        height: 64,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* ---- Logo ---- */}
      <h1
        className="text-lg font-bold select-none"
        style={{
          fontSize: 18,
          fontWeight: 700,
          background: "linear-gradient(to right, #8B5CF6, #6366F1, #3B82F6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        JobSwipe
      </h1>

      {/* ---- Streak ---- */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm" role="img" aria-label="streak flame">
          🔥
        </span>
        <span
          className="text-sm font-medium text-white"
          style={{ fontSize: 14, fontWeight: 500 }}
        >
          {likedCount}
        </span>
        <span
          className="text-sm font-medium text-white"
          style={{ fontSize: 14, fontWeight: 500 }}
        >
          day streak
        </span>
      </div>

      {/* ---- AI Insights ---- */}
      <div
        className="flex items-center gap-1"
        style={{ fontSize: 12, color: "#71717A" }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: "#A1A1AA" }} />
        <span>
          {matchScore !== undefined ? `${matchScore}% match` : "Hot job"}
        </span>
      </div>
    </motion.header>
  );
}

export default Header;
