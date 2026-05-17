export type Role = "candidate" | "company";

export interface UserAccount {
  id: string;
  email?: string;
  isCandidate: boolean;
  isCompany: boolean;
  activeRole: Role;
  createdAt: string;
}
