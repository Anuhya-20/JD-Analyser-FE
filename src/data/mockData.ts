export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  role: string;
  experience: number;
  education: string;
  skills: string[];
  matchScore: number;
  experienceScore: number;
  skillScore: number;
  educationScore: number;
  projectScore: number;
  certificationScore: number;
  communicationScore: number;
  status: 'Applied' | 'Screened' | 'Matched' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  strengths: string[];
  weaknesses: string[];
  aiSummary: string;
  technicalFit: number;
  cultureFit: number;
  projectRelevance: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  hiringConfidence: number;
  recommendation: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  department: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequired: number;
  educationRequired: string;
  certifications: string[];
  description: string;
  candidates: number;
  topMatch: number;
  status: 'Active' | 'Closed' | 'Draft';
}

export const mockCandidates: Candidate[] = [];

export const mockJobs: JobDescription[] = [];

export const pipelineData: { stage: string; count: number; color: string }[] = [];

export const skillDistribution: { skill: string; count: number }[] = [];

export const matchScoreDistribution: { range: string; count: number }[] = [];

export const missingSkills: { skill: string; count: number }[] = [];

export const experienceBreakdown: { range: string; count: number }[] = [];

export const requiredSkillsList: string[] = [];

export const agentWorkflow: {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}[] = [];
