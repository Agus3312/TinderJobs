export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";

export type RemotePolicy = "remote" | "hybrid" | "onsite";

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  industry: string;
  size: CompanySize;
  website?: string;
  location: string;
  remotePolicy: RemotePolicy;
}
