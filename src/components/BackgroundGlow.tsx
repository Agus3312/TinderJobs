"use client";

import { motion } from "framer-motion";

/**
 * BackgroundGlow — Self-contained ambient background component.
 *
 * Renders:
 *   - Base dark fill (#0A0A0F)
 *   - Radial gradient from center-bottom with purple tint
 *   - Animated card glow positioned behind the card area (centered)
 *
 * Usage: Wrap as the outermost background layer behind the card area.
 * Props: none — self-contained, fills parent container.
 */
export function BackgroundGlow() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#0A0A0F" }}
    >
      {/* Radial gradient: center-bottom, purple tint to transparent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
        }}
      />

      {/* Animated card glow — positioned behind the card area */}
      <motion.div
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: 300,
          height: 200,
          x: "-50%",
          y: "-50%",
          borderRadius: "50%",
          filter: "blur(80px)",
          backgroundColor: "rgba(139, 92, 246, 0.4)",
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </div>
  );
}

export default BackgroundGlow;
