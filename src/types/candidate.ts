export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "principal";

export type RemotePreference = "remote" | "hybrid" | "onsite";

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  headline: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  location: string;
  remotePreference: RemotePreference;
  salaryExpectation?: string;
  avatarInitials?: string;
}
