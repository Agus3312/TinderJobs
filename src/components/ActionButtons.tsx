"use client";

import { X, Bookmark, ArrowRight } from "lucide-react";

interface ActionButtonsProps {
  onReject: () => void;
  onSave: () => void;
  onApply: () => void;
  isDisabled?: boolean;
}

export function ActionButtons({ onReject, onSave, onApply, isDisabled = false }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      {/* Reject */}
      <button
        onClick={onReject}
        disabled={isDisabled}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 active:scale-95"
        style={{
          backgroundColor: "var(--danger-dim)",
          border: "1px solid var(--danger-border)",
          color: "var(--danger)",
        }}
      >
        <X className="w-3.5 h-3.5" />
        <span>Pass</span>
      </button>

      {/* Save */}
      <button
        onClick={onSave}
        disabled={isDisabled}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 active:scale-95"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        <Bookmark className="w-3.5 h-3.5" />
        <span>Save</span>
      </button>

      {/* Apply — accent color, stands out */}
      <button
        onClick={onApply}
        disabled={isDisabled}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-95"
        style={{
          backgroundColor: "var(--accent)",
          color: "#000",
        }}
      >
        <ArrowRight className="w-3.5 h-3.5" />
        <span>Apply</span>
      </button>
    </div>
  );
}

export default ActionButtons;