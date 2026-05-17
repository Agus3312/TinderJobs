"use client";

import { ArrowRight } from "lucide-react";

interface MatchReasonProps {
  reasons: string[];
  maxVisible?: number;
}

export function MatchReason({ reasons, maxVisible = 2 }: MatchReasonProps) {
  if (!reasons || reasons.length === 0) return null;

  const visibleReasons = reasons.slice(0, maxVisible);

  return (
    <div className="mt-2.5">
      <h4
        className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: "var(--text-dim)" }}
      >
        Match
      </h4>
      <div className="space-y-1">
        {visibleReasons.map((reason, index) => (
          <div key={index} className="flex items-start gap-1.5">
            <ArrowRight
              className="w-3 h-3 flex-shrink-0 mt-0.5"
              style={{ color: "var(--accent)" }}
            />
            <span className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>
              {reason}
            </span>
          </div>
        ))}
      </div>
      {reasons.length > maxVisible && (
        <p className="text-[11px] mt-1" style={{ color: "var(--text-dim)" }}>
          +{reasons.length - maxVisible} more
        </p>
      )}
    </div>
  );
}

export default MatchReason;