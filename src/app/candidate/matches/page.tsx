"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/hooks/useStore";
import { MatchList } from "@/components/MatchList";

export default function CandidateMatchesPage() {
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);

  useEffect(() => {
    if (!userId) {
      router.replace("/login");
    }
  }, [userId, router]);

  if (!userId) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Title */}
      <div className="text-center pt-6 pb-2">
        <h1
          className="text-xl font-bold tracking-tight"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Your Matches
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Companies you&apos;ve matched with
        </p>
      </div>

      <MatchList role="candidate" />
    </div>
  );
}
