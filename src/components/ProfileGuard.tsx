"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/hooks/useStore";
import { AlertTriangle } from "lucide-react";
import type { Role } from "@/types/user";

interface ProfileGuardProps {
  role: Role;
  children: React.ReactNode;
}

/**
 * Wraps a page and shows a profile completion warning if the user
 * hasn't filled out their profile for the current role.
 * The warning is dismissible — it won't block navigation, just nudge.
 */
export function ProfileGuard({ role, children }: ProfileGuardProps) {
  const candidateProfile = useAppStore((s) => s.candidateProfile);
  const companyProfile = useAppStore((s) => s.companyProfile);
  const [dismissed, setDismissed] = useState(false);

  const isProfileEmpty =
    role === "candidate" ? !candidateProfile : !companyProfile;

  // Reset dismiss state when role changes
  useEffect(() => {
    setDismissed(false);
  }, [role]);

  if (!isProfileEmpty || dismissed) {
    return <>{children}</>;
  }

  const profilePath = `/${role}/profile`;

  return (
    <>
      {/* Dismissible warning banner */}
      <div
        className="mx-4 mt-4 mb-2 rounded-lg p-3 flex items-start gap-3"
        style={{
          backgroundColor: "var(--danger-dim)",
          border: "1px solid var(--danger-border)",
        }}
      >
        <AlertTriangle
          size={18}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "var(--warn)" }}
        />
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Complete your profile
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {role === "candidate"
              ? "Companies want to know who you are. Add your skills and experience to get better matches."
              : "Candidates want to know about your company. Add your company details to attract the right talent."}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a
              href={profilePath}
              className="text-xs font-semibold underline underline-offset-2"
              style={{ color: "var(--accent)" }}
            >
              {role === "candidate" ? "Edit candidate profile" : "Edit company profile"}
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs"
              style={{ color: "var(--text-dim)" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* Original content still renders below the warning */}
      {children}
    </>
  );
}

export default ProfileGuard;