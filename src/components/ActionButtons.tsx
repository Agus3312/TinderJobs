"use client";

import { X, Bookmark, Rocket } from "lucide-react";
import { motion } from "framer-motion";

interface ActionButtonsProps {
  onReject: () => void;
  onSave: () => void;
  onApply: () => void;
  isDisabled?: boolean;
}

export function ActionButtons({ onReject, onSave, onApply, isDisabled = false }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* Reject Button - Pill */}
      <motion.button
        onClick={onReject}
        disabled={isDisabled}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors"
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          backdropFilter: "blur(10px)",
        }}
        whileHover={{
          scale: 1.05,
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <X className="w-4 h-4 text-[#EF4444]" />
        <span className="text-sm font-medium text-[#EF4444]">Pass</span>
      </motion.button>

      {/* Save Button - Pill */}
      <motion.button
        onClick={onSave}
        disabled={isDisabled}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors"
        style={{
          backgroundColor: "rgba(245, 158, 11, 0.08)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          backdropFilter: "blur(10px)",
        }}
        whileHover={{
          scale: 1.05,
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <Bookmark className="w-4 h-4 text-[#F59E0B]" />
        <span className="text-sm font-medium text-[#F59E0B]">Save</span>
      </motion.button>

      {/* Apply Button - Gradient Pill */}
      <motion.button
        onClick={onApply}
        disabled={isDisabled}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full"
        style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)",
          boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
        }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 6px 25px rgba(139, 92, 246, 0.5)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <Rocket className="w-4 h-4 text-white" />
        <span className="text-sm font-semibold text-white">Apply</span>
      </motion.button>
    </div>
  );
}

export default ActionButtons;