"use client";

import { useMotionValue, useTransform } from "framer-motion";
import { useCallback } from "react";
import { MotionValue } from "framer-motion";

interface UseSwipeGestureProps {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface SwipeState {
  x: MotionValue<number>;
  rotate: MotionValue<number>;
  opacity: MotionValue<number>;
  handleSwipe: (offsetX: number) => void;
}

export function useSwipeGesture({
  threshold = 100,
  onSwipeLeft,
  onSwipeRight,
}: UseSwipeGestureProps = {}): SwipeState {
  const x = useMotionValue(0);

  // Rotate card based on drag position (-15 to 15 degrees)
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  // Opacity fades at edges: 1 at center, 0.6 at edges
  const opacity = useTransform(x, [-200, 0, 200], [0.6, 1, 0.6]);

  const handleSwipe = useCallback(
    (offsetX: number) => {
      if (offsetX > threshold) {
        onSwipeRight?.();
      } else if (offsetX < -threshold) {
        onSwipeLeft?.();
      }
    },
    [threshold, onSwipeLeft, onSwipeRight]
  );

  return {
    x,
    rotate,
    opacity,
    handleSwipe,
  };
}