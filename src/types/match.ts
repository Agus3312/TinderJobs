import { CandidateProfile } from "./candidate";
import { CompanyProfile } from "./company";
import { Job } from "./job";

export type MatchStatus = "matched";

export interface Match {
  id: string;
  candidateId: string;
  companyId: string;
  jobId?: number;
  candidateSnapshot: CandidateProfile;
  companySnapshot: CompanyProfile;
  jobSnapshot?: Job;
  createdAt: string;
  status: MatchStatus;
}
