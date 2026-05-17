"use client";

import { Check } from "lucide-react";

interface MatchReasonProps {
  reasons: string[];
  maxVisible?: number;
}

export function MatchReason({ reasons, maxVisible = 3 }: MatchReasonProps) {
  if (!reasons || reasons.length === 0) {
    return null;
  }

  const visibleReasons = reasons.slice(0, maxVisible);

  return (
    <div className="mt-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#71717A] mb-1">
        Why it matches you
      </h4>
      <div className="space-y-1">
        {visibleReasons.map((reason, index) => (
          <div
            key={index}
            className="flex items-start gap-2"
          >
            <Check className="w-3 h-3 text-[#10B981] flex-shrink-0 mt-0.5" />
            <span className="text-xs text-[#A1A1AA] leading-snug">
              {reason}
            </span>
          </div>
        ))}
      </div>
      {reasons.length > maxVisible && (
        <p className="text-xs text-[#71717A] mt-2">
          +{reasons.length - maxVisible} more reasons
        </p>
      )}
    </div>
  );
}

export default MatchReason;