"use client";

import { motion } from "framer-motion";

interface SwipeOverlayProps {
  progress: number; // -1 (left swipe) to 1 (right swipe)
}

export function SwipeOverlay({ progress }: SwipeOverlayProps) {
  // Calculate opacity for left/right overlays with max 0.4
  // Left overlay appears when progress < -0.15
  const leftIntensity = Math.abs(Math.min(0, progress));
  const rightIntensity = Math.max(0, progress);

  const leftOpacity = Math.min(0.4, leftIntensity * 0.5);
  const rightOpacity = Math.min(0.4, rightIntensity * 0.5);

  // Show overlays only past threshold
  const showLeft = progress < -0.15;
  const showRight = progress > 0.15;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-10">
      {/* LEFT OVERLAY — NOPE */}
      {showLeft && (
        <motion.div
          className="absolute inset-y-0 left-0 w-full flex items-center justify-start pl-8"
          style={{
            background: `linear-gradient(to right, rgba(239, 68, 68, ${leftOpacity}), transparent 60%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <motion.span
            className="text-2xl font-bold text-[#EF4444] border-4 border-[#EF4444] rounded-lg px-6 py-2"
            style={{
              transform: "rotate(-12deg)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            NOPE
          </motion.span>
        </motion.div>
      )}

      {/* RIGHT OVERLAY — LIKE */}
      {showRight && (
        <motion.div
          className="absolute inset-y-0 right-0 w-full flex items-center justify-end pr-8"
          style={{
            background: `linear-gradient(to left, rgba(16, 185, 129, ${rightOpacity}), transparent 60%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <motion.span
            className="text-2xl font-bold text-[#10B981] border-4 border-[#10B981] rounded-lg px-6 py-2"
            style={{
              transform: "rotate(12deg)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            LIKE
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}

export default SwipeOverlay;
