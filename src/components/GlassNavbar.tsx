"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  Bookmark,
  User,
  Users,
  Heart,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/user";

type TabId = "feed" | "search" | "saved" | "profile" | "browse" | "matches";

interface GlassNavbarProps {
  role?: Role;
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

interface TabConfig {
  id: TabId;
  icon: LucideIcon;
  label: string;
  path: string;
}

const candidateTabs: TabConfig[] = [
  { id: "feed", icon: Home, label: "Feed", path: "/candidate/swipe" },
  { id: "search", icon: Search, label: "Search", path: "/candidate/search" },
  { id: "saved", icon: Bookmark, label: "Saved", path: "/candidate/saved" },
  { id: "profile", icon: User, label: "Profile", path: "/candidate/profile" },
];

const companyTabs: TabConfig[] = [
  { id: "browse", icon: Users, label: "Browse", path: "/company/swipe" },
  { id: "search", icon: Search, label: "Search", path: "/company/search" },
  { id: "matches", icon: Heart, label: "Matches", path: "/company/matches" },
  { id: "profile", icon: Building2, label: "Profile", path: "/company/profile" },
];

function getActiveTab(pathname: string, tabs: TabConfig[]): TabId {
  // Match: tab whose path is a prefix of current pathname
  const match = tabs.find((tab) => pathname.startsWith(tab.path));
  return match?.id ?? tabs[0].id;
}

export function GlassNavbar({
  role = "candidate",
  activeTab: externalActiveTab,
  onTabChange,
}: GlassNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = role === "candidate" ? candidateTabs : companyTabs;

  // External activeTab overrides pathname-based detection (for controlled usage)
  const activeTab = externalActiveTab ?? getActiveTab(pathname, tabs);

  const handleTabClick = (tab: TabConfig) => {
    if (onTabChange) {
      onTabChange(tab.id);
    }
    // Only navigate if we're not already at that path
    if (!pathname.startsWith(tab.path)) {
      router.push(tab.path);
    }
  };

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
                onClick={() => handleTabClick(tab)}
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
