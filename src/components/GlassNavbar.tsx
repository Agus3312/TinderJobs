"use client";

import { Home, Search, Bookmark, User, type LucideIcon } from "lucide-react";

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

export function GlassNavbar({ activeTab = "feed", onTabChange }: GlassNavbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav
        className="max-w-md mx-auto"
        style={{
          height: 56,
          backgroundColor: "var(--bg)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-around h-full px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 transition-colors duration-150"
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-dim)",
                    transition: "color 150ms ease",
                  }}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-dim)",
                    transition: "color 150ms ease",
                  }}
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