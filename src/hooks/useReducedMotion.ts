"use client";

import { useState, useEffect } from "react";

/**
 * useReducedMotion — Detects if the user prefers reduced motion.
 *
 * Uses matchMedia to check `(prefers-reduced-motion: reduce)`.
 * Returns `true` when animations should be disabled or minimized.
 *
 * Usage:
 *   const reducedMotion = useReducedMotion();
 *   if (reducedMotion) { /* disable spring / use instant transition *\/ }
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setReducedMotion(mql.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

export default useReducedMotion;
