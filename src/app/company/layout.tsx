"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { GlassNavbar } from "@/components/GlassNavbar";
import { useAppStore } from "@/hooks/useStore";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const likedCount = useAppStore((s) => s.companyLikedCandidates.length);
  const isCandidate = useAppStore((s) => s.isCandidate);
  const isCompany = useAppStore((s) => s.isCompany);
  const activeRole = useAppStore((s) => s.activeRole);
  const setActiveRole = useAppStore((s) => s.setActiveRole);
  const logout = useAppStore((s) => s.logout);

  const handleSwitchRole = useCallback(() => {
    const newRole = activeRole === "candidate" ? "company" : "candidate";
    setActiveRole(newRole);
    router.push(`/${newRole}/swipe`);
  }, [activeRole, setActiveRole, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Header
        likedCount={likedCount}
        activeRole={activeRole}
        onSwitchRole={isCandidate && isCompany ? handleSwitchRole : undefined}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col pt-14 pb-14">{children}</main>
      <GlassNavbar role="company" />
    </div>
  );
}
