import { api } from '@/lib/api';

/* ── Types ─────────────────────────────────────────────── */

export interface ScoreDistribution {
  ranges: { label: string; count: number; percentage: number }[];
  total_candidates: number;
  avg_score: number;
}

export interface ScoreComponents {
  components: {
    name: string;
    label: string;
    average: number;
    maximum: number;
    minimum: number;
  }[];
  overall_average: number;
  total_candidates: number;
}

export interface RecommendationBreakdown {
  levels: { label: string; count: number; percentage: number }[];
  total: number;
}

export interface SkillAnalysis {
  top_matched_skills: { skill: string; candidate_count: number; percentage: number }[];
  top_missing_skills:  { skill: string; candidate_count: number; percentage: number }[];
  total_candidates: number;
  avg_matched_count: number;
  avg_missing_count: number;
}

export interface CandidateTiers {
  tiers: { label: string; count: number; percentage: number }[];
  total: number;
}

export interface ExperienceDistribution {
  buckets: { range: string; label: string; count: number; percentage: number }[];
  avg_years: number;
  max_years: number;
  min_years: number;
  total_candidates: number;
}

/* ── API calls ─────────────────────────────────────────── */

const base = (jdId: string) => `/api/v1/analytics/${jdId}`;

export const analyticsApi = {
  scoreDistribution:       (jdId: string) => api.get<ScoreDistribution>(`${base(jdId)}/score-distribution`),
  scoreComponents:         (jdId: string) => api.get<ScoreComponents>(`${base(jdId)}/score-components`),
  recommendationBreakdown: (jdId: string) => api.get<RecommendationBreakdown>(`${base(jdId)}/recommendation-breakdown`),
  skillAnalysis:           (jdId: string) => api.get<SkillAnalysis>(`${base(jdId)}/skill-analysis`),
  candidateTiers:          (jdId: string) => api.get<CandidateTiers>(`${base(jdId)}/candidate-tiers`),
  experienceDistribution:  (jdId: string) => api.get<ExperienceDistribution>(`${base(jdId)}/experience-distribution`),
};
