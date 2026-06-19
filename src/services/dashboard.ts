import { api } from '@/lib/api';

export interface WeeklyActivity {
  day: string;
  date: string;
  resumes: number;
  matches: number;
  shortlisted: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
}

export interface DashboardOverview {
  total_candidates: number;
  total_candidates_change_pct: number;
  active_jobs: number;
  new_jobs_this_week: number;
  shortlisted: number;
  shortlist_rate: number;
  avg_match_score: number;
  avg_match_score_change_pct: number;
  weekly_activity: WeeklyActivity[];
  pipeline: PipelineStage[];
}

export const getDashboardOverview = () =>
  api.get<DashboardOverview>('/api/v1/dashboard/overview');
