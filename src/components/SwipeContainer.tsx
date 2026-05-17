"use client";

import { motion, AnimatePresence, useMotionValueEvent } from "framer-motion";
import { useState, ReactNode, useCallback } from "react";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SwipeOverlay } from "./SwipeOverlay";

interface SwipeContainerProps {
  children: ReactNode;
  onSwipe: (direction: "left" | "right") => void;
  threshold?: number;
  className?: string;
  isActive?: boolean;
}

export function SwipeContainer({
  children,
  onSwipe,
  threshold = 150,
  className = "",
  isActive = true,
}: SwipeContainerProps) {
  const reducedMotion = useReducedMotion();

  const { x, rotate, opacity } = useSwipeGesture({
    threshold,
    onSwipeLeft: () => {},
    onSwipeRight: () => {},
  });

  const [isDragging, setIsDragging] = useState(false);
  const [exitState, setExitState] = useState<{
    direction: "left" | "right";
  } | null>(null);
  const [dragProgress, setDragProgress] = useState(0);

  // Track drag x position to feed the SwipeOverlay progress
  useMotionValueEvent(x, "change", (latest) => {
    const progress = Math.max(-1, Math.min(1, latest / 200));
    setDragProgress(progress);
  });

  const onDragEnd = useCallback(
    (_: any, info: any) => {
      const offsetX = info.offset.x;

      if (offsetX > threshold && isActive && !exitState) {
        setExitState({ direction: "right" });
      } else if (offsetX < -threshold && isActive && !exitState) {
        setExitState({ direction: "left" });
      }
      setIsDragging(false);
    },
    [threshold, isActive, exitState]
  );

  // Pre-compute exit values from exitState
  const exitX =
    exitState?.direction === "right"
      ? 500
      : exitState?.direction === "left"
        ? -500
        : 0;
  const exitRotate =
    exitState?.direction === "right"
      ? 30
      : exitState?.direction === "left"
        ? -30
        : 0;

  // Premium spring configuration — disabled when reduced motion preferred
  const springConfig = reducedMotion
    ? { duration: 0.01 }
    : {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      };

  // Exit animation transition — instant when reduced motion preferred
  const exitTransition = reducedMotion
    ? { duration: 0.01 }
    : {
        duration: 0.3,
        ease: "easeOut" as const,
      };

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (exitState) {
          onSwipe(exitState.direction);
        }
      }}
    >
      {!exitState && (
        <motion.div
          key="swipe-card"
          style={{
            x: isActive ? x : 0,
            rotate: isActive ? rotate : 0,
            opacity: isActive ? opacity : 0.6,
            position: "absolute",
            zIndex: 1,
          }}
          drag={isActive ? "x" : false}
          dragConstraints={
            isActive ? { left: -300, right: 300 } : false
          }
          dragElastic={0.7}
          onDragStart={() => isActive && setIsDragging(true)}
          onDragEnd={isActive ? onDragEnd : undefined}
          initial={isActive ? { scale: 0.8, opacity: 0 } : false}
          animate={
            isActive
              ? { scale: 1, x: 0 }
              : { scale: 0.95, opacity: 0.6 }
          }
          exit={{
            x: exitX,
            rotate: exitRotate,
            opacity: 0,
            scale: 0.9,
            transition: exitTransition,
          }}
          transition={springConfig}
          className={`w-[340px] h-[480px] bg-white rounded-3xl shadow-2xl ${
            isActive && !isDragging
              ? "cursor-grab"
              : isActive && isDragging
                ? "cursor-grabbing"
                : ""
          } overflow-hidden ${className}`}
        >
          {children}
          {isActive && <SwipeOverlay progress={dragProgress} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SwipeContainer;
