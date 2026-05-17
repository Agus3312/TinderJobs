"use client";

import { Briefcase, Building2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/hooks/useStore";

type RoleChoice = "candidate" | "company" | "both";

interface RoleOption {
  id: RoleChoice;
  icon: typeof Briefcase;
  label: string;
  description: string;
  roles: { isCandidate: boolean; isCompany: boolean };
}

const options: RoleOption[] = [
  {
    id: "candidate",
    icon: Briefcase,
    label: "I'm looking for work",
    description: "Swipe through job offers and find your next opportunity",
    roles: { isCandidate: true, isCompany: false },
  },
  {
    id: "company",
    icon: Building2,
    label: "I'm hiring",
    description: "Browse candidates and find the right talent for your team",
    roles: { isCandidate: false, isCompany: true },
  },
  {
    id: "both",
    icon: Users,
    label: "Both",
    description: "Explore jobs and candidates — switch roles anytime",
    roles: { isCandidate: true, isCompany: true },
  },
];

export function RoleSelector() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);

  const handleSelect = (choice: RoleChoice) => {
    const option = options.find((o) => o.id === choice);
    if (!option) return;

    login(option.roles);

    // Read activeRole AFTER login to get the resolved value
    const state = useAppStore.getState();
    const role = state.activeRole;
    router.push(`/${role}/swipe`);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Heading */}
      <div className="text-center mb-10">
        <h1
          className="text-2xl font-bold tracking-tight mb-2"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          jobswipe
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          How would you like to use the app?
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className="flex items-start gap-4 p-4 rounded-xl text-left transition-colors duration-150 active:scale-[0.98]"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--border)";
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                style={{ backgroundColor: "var(--accent-dim)" }}
              >
                <Icon size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {option.label}
                </span>
                <span
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {option.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RoleSelector;
