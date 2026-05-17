"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { GlassNavbar } from "@/components/GlassNavbar";
import { useAppStore } from "@/hooks/useStore";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const likedCount = useAppStore((s) => s.candidateLikedJobs.length);
  const isCandidate = useAppStore((s) => s.isCandidate);
  const isCompany = useAppStore((s) => s.isCompany);
  const activeRole = useAppStore((s) => s.activeRole);
  const setActiveRole = useAppStore((s) => s.setActiveRole);

  const handleSwitchRole = useCallback(() => {
    const newRole = activeRole === "candidate" ? "company" : "candidate";
    setActiveRole(newRole);
    router.push(`/${newRole}/swipe`);
  }, [activeRole, setActiveRole, router]);

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Header
        likedCount={likedCount}
        activeRole={activeRole}
        onSwitchRole={isCandidate && isCompany ? handleSwitchRole : undefined}
      />
      <main className="flex-1 flex flex-col pt-14 pb-14">{children}</main>
      <GlassNavbar role="candidate" />
    </div>
  );
}
