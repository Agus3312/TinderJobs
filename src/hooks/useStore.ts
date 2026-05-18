"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, UserAccount } from "@/types/user";
import type { CandidateProfile } from "@/types/candidate";
import type { CompanyProfile } from "@/types/company";
import type { Match } from "@/types/match";
import type { Job } from "@/types/job";
import { mockJobs } from "@/data/mockJobs";
import { mockCandidates } from "@/data/mockCandidates";
import { mockCompanies } from "@/data/mockCompanies";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ── Store Interface ────────────────────────────────────────────────────────

export interface AppStore {
  // Auth
  userId: string | null;
  isCandidate: boolean;
  isCompany: boolean;
  activeRole: Role;
  login: (roles: { isCandidate: boolean; isCompany: boolean }) => void;
  logout: () => void;
  setActiveRole: (role: Role) => void;

  // Candidate Profile
  candidateProfile: CandidateProfile | null;
  setCandidateProfile: (profile: CandidateProfile) => void;

  // Company Profile
  companyProfile: CompanyProfile | null;
  setCompanyProfile: (profile: CompanyProfile) => void;

  // Candidate Swiping (jobs)
  candidateLikedJobs: number[];
  candidatePassedJobs: number[];
  candidateSwipeIndex: number;
  candidateSwipeJob: (jobId: number, direction: "left" | "right") => void;
  resetCandidateSwipes: () => void;
  candidateSavedJobs: number[];
  toggleCandidateSavedJob: (jobId: number) => void;

  // Company Swiping (candidates)
  companyLikedCandidates: string[];
  companyPassedCandidates: string[];
  companySwipeIndex: number;
  companySwipeCandidate: (candidateId: string, direction: "left" | "right") => void;
  resetCompanySwipes: () => void;
  companySavedCandidates: string[];
  toggleCompanySavedCandidate: (candidateId: string) => void;

  // Matches
  matches: Match[];
  checkAndCreateMatch: (
    swiperRole: Role,
    swiperId: string,
    targetId: string | number,
  ) => Match | null;
  getMatchesForRole: (role: Role) => Match[];
}

// ── Initial State ──────────────────────────────────────────────────────────

const initialAuth = {
  userId: null as string | null,
  isCandidate: false,
  isCompany: false,
  activeRole: "candidate" as Role,
};

const initialCandidateSwiping = {
  candidateLikedJobs: [] as number[],
  candidatePassedJobs: [] as number[],
  candidateSwipeIndex: 0,
  candidateSavedJobs: [] as number[],
};

const initialCompanySwiping = {
  companyLikedCandidates: [] as string[],
  companyPassedCandidates: [] as string[],
  companySwipeIndex: 0,
  companySavedCandidates: [] as string[],
};

const initialMatches: Match[] = [];

// ── Store Creation ─────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Auth ──
      ...initialAuth,

      login: (roles) => {
        const { userId } = get();
        const id = userId ?? generateId();
        const activeRole: Role = roles.isCompany ? "company" : "candidate";
        set({
          userId: id,
          isCandidate: roles.isCandidate,
          isCompany: roles.isCompany,
          activeRole,
          createdAt: new Date().toISOString(),
        } as Partial<AppStore>);
      },

      logout: () => {
        set({
          userId: null,
          isCandidate: false,
          isCompany: false,
          activeRole: "candidate",
          candidateProfile: null,
          companyProfile: null,
          candidateLikedJobs: [],
          candidatePassedJobs: [],
          candidateSwipeIndex: 0,
          candidateSavedJobs: [],
          companyLikedCandidates: [],
          companyPassedCandidates: [],
          companySwipeIndex: 0,
          companySavedCandidates: [],
          matches: [],
        });
      },

      setActiveRole: (role) => {
        set({ activeRole: role });
      },

      // ── Candidate Profile ──
      candidateProfile: null,

      setCandidateProfile: (profile) => {
        set({ candidateProfile: profile });
      },

      // ── Company Profile ──
      companyProfile: null,

      setCompanyProfile: (profile) => {
        set({ companyProfile: profile });
      },

      // ── Candidate Swiping ──
      ...initialCandidateSwiping,

      candidateSwipeJob: (jobId, direction) => {
        const state = get();
        const alreadySwiped =
          state.candidateLikedJobs.includes(jobId) ||
          state.candidatePassedJobs.includes(jobId);
        if (alreadySwiped) return;

        if (direction === "right") {
          set({
            candidateLikedJobs: [...state.candidateLikedJobs, jobId],
            candidateSwipeIndex: state.candidateSwipeIndex + 1,
          });
          // Trigger match detection after right-swipe
          get().checkAndCreateMatch("candidate", state.userId!, jobId);
        } else {
          set({
            candidatePassedJobs: [...state.candidatePassedJobs, jobId],
            candidateSwipeIndex: state.candidateSwipeIndex + 1,
          });
        }
      },

      resetCandidateSwipes: () => {
        set({
          candidateLikedJobs: [],
          candidatePassedJobs: [],
          candidateSwipeIndex: 0,
        });
      },

      toggleCandidateSavedJob: (jobId) => {
        const state = get();
        if (state.candidateSavedJobs.includes(jobId)) {
          set({ candidateSavedJobs: state.candidateSavedJobs.filter((id) => id !== jobId) });
        } else {
          set({ candidateSavedJobs: [...state.candidateSavedJobs, jobId] });
        }
      },

      // ── Company Swiping ──
      ...initialCompanySwiping,

      companySwipeCandidate: (candidateId, direction) => {
        const state = get();
        const alreadySwiped =
          state.companyLikedCandidates.includes(candidateId) ||
          state.companyPassedCandidates.includes(candidateId);
        if (alreadySwiped) return;

        if (direction === "right") {
          set({
            companyLikedCandidates: [...state.companyLikedCandidates, candidateId],
            companySwipeIndex: state.companySwipeIndex + 1,
          });
          // Trigger match detection after right-swipe
          get().checkAndCreateMatch("company", state.userId!, candidateId);
        } else {
          set({
            companyPassedCandidates: [...state.companyPassedCandidates, candidateId],
            companySwipeIndex: state.companySwipeIndex + 1,
          });
        }
      },

      resetCompanySwipes: () => {
        set({
          companyLikedCandidates: [],
          companyPassedCandidates: [],
          companySwipeIndex: 0,
        });
      },

      toggleCompanySavedCandidate: (candidateId) => {
        const state = get();
        if (state.companySavedCandidates.includes(candidateId)) {
          set({ companySavedCandidates: state.companySavedCandidates.filter((id) => id !== candidateId) });
        } else {
          set({ companySavedCandidates: [...state.companySavedCandidates, candidateId] });
        }
      },

      // ── Matches ──
      matches: initialMatches,

      checkAndCreateMatch: (swiperRole, swiperId, targetId) => {
        const state = get();
        // Must be authenticated with both roles having profiles to match
        if (!state.userId) return null;

        if (swiperRole === "candidate") {
          // Candidate swiped right on a job
          const job = mockJobs.find((j) => j.id === (targetId as number));
          if (!job || !job.companyUserId) return null;

          const companyId = job.companyUserId;

          // Self-match guard: same user can't match with their own company
          if (companyId === swiperId) return null;

          const companyProfile =
            state.companyProfile ??
            mockCompanies.find((c) => c.userId === companyId) ??
            null;
          if (!companyProfile) return null;

          const candidateProfile =
            state.candidateProfile ??
            mockCandidates.find((c) => c.userId === swiperId) ??
            null;
          if (!candidateProfile) return null;

          // Has this company liked this candidate?
          const hasCompanyLiked = state.companyLikedCandidates.includes(
            candidateProfile.id,
          );
          if (!hasCompanyLiked) return null;

          // Idempotent: skip if match already exists
          const alreadyMatched = state.matches.some(
            (m) =>
              m.candidateId === candidateProfile.id &&
              m.companyId === companyProfile.id,
          );
          if (alreadyMatched) return null;

          return createMatch(candidateProfile, companyProfile, job);
        } else {
          // Company swiped right on a candidate
          const candidateId = targetId as string;
          const candidate =
            mockCandidates.find((c) => c.id === candidateId) ?? null;
          if (!candidate) return null;

          // Self-match guard: same user can't match with themselves
          if (candidate.userId === swiperId) return null;

          const companyProfile =
            state.companyProfile ??
            mockCompanies.find((c) => c.userId === swiperId) ??
            null;
          if (!companyProfile) return null;

          // Has this candidate liked any job from this company?
          const companyJobs = mockJobs.filter(
            (j) => j.companyUserId === companyProfile.userId,
          );
          const companyJobIds = companyJobs.map((j) => j.id);
          const hasLikedCompanyJob = state.candidateLikedJobs.some((jobId) =>
            companyJobIds.includes(jobId),
          );
          if (!hasLikedCompanyJob) return null;

          // Idempotent: skip if match already exists
          const alreadyMatched = state.matches.some(
            (m) =>
              m.candidateId === candidate.id &&
              m.companyId === companyProfile.id,
          );
          if (alreadyMatched) return null;

          // Find which job the candidate liked
          const matchedJob = mockJobs.find(
            (j) =>
              j.companyUserId === companyProfile.userId &&
              state.candidateLikedJobs.includes(j.id),
          );

          return createMatch(candidate, companyProfile, matchedJob ?? undefined);
        }

        function createMatch(
          candidateProfile: CandidateProfile,
          companyProfile: CompanyProfile,
          job?: Job,
        ): Match {
          const match: Match = {
            id: generateId(),
            candidateId: candidateProfile.id,
            companyId: companyProfile.id,
            jobId: job?.id,
            candidateSnapshot: clone(candidateProfile),
            companySnapshot: clone(companyProfile),
            jobSnapshot: job ? clone(job) : undefined,
            createdAt: new Date().toISOString(),
            status: "matched",
          };

          set((s) => ({
            matches: [...s.matches, match],
          }));

          return match;
        }
      },

      getMatchesForRole: (role) => {
        const state = get();
        const profile =
          role === "candidate" ? state.candidateProfile : state.companyProfile;
        if (!profile) return [];

        return state.matches
          .filter((m) =>
            role === "candidate"
              ? m.candidateId === profile.id
              : m.companyId === profile.id,
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      },

      // The `createdAt` field is only set on login, but we need it for the
      // UserAccount interface. We store it as a transient field not persisted.
    } as AppStore & { createdAt?: string }),
    {
      name: "tinderjobs-store",
      version: 1,

      onRehydrateStorage: () => {
        return (rehydratedState) => {
          if (!rehydratedState) return;

          const state = rehydratedState as AppStore & {
            candidateLikedJobs?: number[];
            candidatePassedJobs?: number[];
            candidateSwipeIndex?: number;
          };

          // Legacy migration: ingest old localStorage keys if store is empty
          if (
            typeof window !== "undefined" &&
            Array.isArray(state.candidateLikedJobs) &&
            state.candidateLikedJobs.length === 0
          ) {
            try {
              const legacyLiked = localStorage.getItem("job-swipe-liked");
              if (legacyLiked) {
                const liked = JSON.parse(legacyLiked) as number[];
                const passedStr = localStorage.getItem("job-swipe-passed");
                const passed = passedStr
                  ? (JSON.parse(passedStr) as number[])
                  : [];
                const indexStr = localStorage.getItem("job-swipe-index");
                const index = indexStr ? parseInt(indexStr, 10) : 0;

                // Use setState to ingest legacy data
                useAppStore.setState({
                  candidateLikedJobs: liked,
                  candidatePassedJobs: passed,
                  candidateSwipeIndex: index,
                });

                // Clean up legacy keys
                localStorage.removeItem("job-swipe-liked");
                localStorage.removeItem("job-swipe-passed");
                localStorage.removeItem("job-swipe-index");
              }
            } catch {
              // Silently ignore parsing errors on legacy data
            }
          }
        };
      },
    },
  ),
);
