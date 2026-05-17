"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/hooks/useStore";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";

export default function CompanyProfilePage() {
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
          Company Profile
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Show candidates what makes your company a great place to work
        </p>
      </div>

      <CompanyProfileForm />
    </div>
  );
}
