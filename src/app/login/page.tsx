"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/hooks/useStore";
import { RoleSelector } from "@/components/RoleSelector";

export default function LoginPage() {
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);
  const activeRole = useAppStore((s) => s.activeRole);

  useEffect(() => {
    if (userId) {
      router.replace(`/${activeRole}/swipe`);
    }
  }, [userId, activeRole, router]);

  // Don't flash the selector if already authenticated (redirecting)
  if (userId) {
    return null;
  }

  return <RoleSelector />;
}
