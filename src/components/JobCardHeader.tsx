"use client";

import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface JobCardHeaderProps {
  company: string;
  logo: string;
  matchScore: number;
  posted: string;
  location?: string;
}

// Helper to check if string is an emoji
function isEmoji(str: string): boolean {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
}

// Helper to get company initials
function getInitials(company: string): string {
  const words = company.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return company.substring(0, 2).toUpperCase();
}

export function JobCardHeader({ company, logo, matchScore, posted }: JobCardHeaderProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate the score counter from 0 to matchScore
  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = matchScore;

    const animateCount = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out easing
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * eased);

      setDisplayScore(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    animateCount();
  }, [matchScore]);

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Company Logo and Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Logo - show as text if emoji, otherwise show initial */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {logo && !isEmoji(logo) && logo.startsWith("http") ? (
            <img
              src={logo}
              alt={`${company} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-lg font-bold">
              {getInitials(company)}
            </span>
          )}
        </div>

        {/* Company Name and Location */}
        <div className="min-w-0">
          <h3 className="text-base font-medium text-[#A1A1AA] truncate">
            {company}
          </h3>
          <div className="flex items-center gap-1 text-xs text-[#71717A]">
            <MapPin className="w-3 h-3" />
            <span>{posted}</span>
          </div>
        </div>
      </div>

      {/* AI Match Badge */}
      <motion.div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex-shrink-0"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <span className="text-white text-xs font-semibold">AI</span>
        <span className="text-white text-sm font-bold">{displayScore}%</span>
      </motion.div>
    </div>
  );
}

export default JobCardHeader;