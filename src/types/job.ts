export interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  remote: boolean;
  stack: string[];
  description: string;
  posted: string;
  // New fields for redesign
  matchScore?: number;
  matchReasons?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'principal';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  benefits?: string[];
  companyDescription?: string;
  companySize?: string;
  // Dual-marketplace: links job to a company profile
  companyUserId?: string;
}