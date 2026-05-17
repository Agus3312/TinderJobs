"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CardStackProps {
  /** The active (front) card to render */
  children: React.ReactNode;
  /** How many ghost cards to show behind (default 2) */
  cardsBehind?: number;
}

/**
 * CardStack — Renders ghost cards behind the active card.
 *
 * Props:
 *   - children: the current (front-facing) card node
 *   - cardsBehind: number of faded preview cards (default 2)
 *
 * Behind cards use progressive scale, opacity, and translateY:
 *   Card 2 (immediate behind): scale 0.95, y 8px, opacity 0.7
 *   Card 3 (further behind):    scale 0.90, y 16px, opacity 0.4
 *
 * Behind cards are pointer-events-none. Uses Framer Motion for smooth
 * entrance/exit transitions.
 */
export function CardStack({ children, cardsBehind = 2 }: CardStackProps) {
  // Configuration for each behind-slot
  const behindConfigs = [
    { scale: 0.95, translateY: 8, opacity: 0.7 },
    { scale: 0.9, translateY: 16, opacity: 0.4 },
  ];

  return (
    <div className="relative flex items-center justify-center">
      {/* Ghost cards behind */}
      <AnimatePresence>
        {Array.from({ length: cardsBehind }).map((_, index) => {
          const cfg = behindConfigs[index] || {
            scale: 0.85,
            translateY: 24,
            opacity: 0.25,
          };

          return (
            <motion.div
              key={`ghost-${index}`}
              className="absolute pointer-events-none glass-fallback w-[360px] h-[520px] md:w-[400px] md:h-[560px]"
              style={{
                borderRadius: "var(--card-border-radius, 28px)",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: `
                  0 4px 6px -1px rgba(0, 0, 0, 0.1),
                  0 0 20px -5px rgba(139, 92, 246, 0.15)
                `,
              }}
              initial={{
                scale: cfg.scale - 0.05,
                y: cfg.translateY + 12,
                opacity: 0,
              }}
              animate={{
                scale: cfg.scale,
                y: cfg.translateY,
                opacity: cfg.opacity,
              }}
              exit={{
                scale: cfg.scale - 0.05,
                y: cfg.translateY + 12,
                opacity: 0,
              }}
              transition={{
                duration: 0.35,
                ease: "easeOut",
              }}
            />
          );
        })}
      </AnimatePresence>

      {/* Active card (children) */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default CardStack;
