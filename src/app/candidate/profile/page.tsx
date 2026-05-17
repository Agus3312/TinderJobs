"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/hooks/useStore";
import { CandidateProfileForm } from "@/components/CandidateProfileForm";

export default function CandidateProfilePage() {
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
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          }}
        >
          Your Profile
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Keep your profile up to date so companies can find you
        </p>
      </div>

      <CandidateProfileForm />
    </div>
  );
}
