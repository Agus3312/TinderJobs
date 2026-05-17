"use client";

import { Home, Search, Bookmark, User, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type TabId = "feed" | "search" | "saved" | "profile";

interface GlassNavbarProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

interface TabConfig {
  id: TabId;
  icon: LucideIcon;
  label: string;
}

const tabs: TabConfig[] = [
  { id: "feed", icon: Home, label: "Feed" },
  { id: "search", icon: Search, label: "Search" },
  { id: "saved", icon: Bookmark, label: "Saved" },
  { id: "profile", icon: User, label: "Profile" },
];

export function GlassNavbar({
  activeTab = "feed",
  onTabChange,
}: GlassNavbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-2">
      <nav
        className="glass-fallback w-full max-w-md rounded-2xl"
        style={{
          height: 64,
          backgroundColor: "rgba(26, 26, 36, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="flex items-center justify-around h-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 transition-colors duration-200"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{
                    color: isActive ? "#8B5CF6" : "#71717A",
                    filter: isActive
                      ? "drop-shadow(0 0 6px rgba(139, 92, 246, 0.5))"
                      : "none",
                    transition: "color 200ms ease, filter 200ms ease",
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(to right, #8B5CF6, #6366F1, #3B82F6)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }
                      : {
                          color: "#71717A",
                          transition: "color 200ms ease",
                        }
                  }
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export type { TabId };
export default GlassNavbar;