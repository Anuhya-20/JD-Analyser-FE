import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, Star, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getDashboardOverview, type DashboardOverview } from '@/services/dashboard';
import { toast } from '@/components/ui/Toast';

const PIPELINE_COLORS: Record<string, string> = {
  Applied: '#818CF8',
  Screened: '#2563EB',
  Matched: '#1E3A8A',
  Shortlisted: '#172554',
  Interview: '#10B981',
  Selected: '#059669',
  Rejected: '#EF4444',
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
};

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count}</>;
}

function buildKpiCards(data: DashboardOverview) {
  return [
    {
      label: 'Total Candidates',
      value: data.total_candidates,
      icon: Users,
      color: 'blue',
      trend: `${data.total_candidates_change_pct >= 0 ? '+' : ''}${data.total_candidates_change_pct}%`,
      up: data.total_candidates_change_pct >= 0,
      sub: 'vs last month',
    },
    {
      label: 'Active Jobs',
      value: data.active_jobs,
      icon: Briefcase,
      color: 'emerald',
      trend: `+${data.new_jobs_this_week}`,
      up: true,
      sub: 'new this week',
    },
    {
      label: 'Shortlisted',
      value: data.shortlisted,
      icon: Star,
      color: 'amber',
      trend: `${data.shortlist_rate}%`,
      up: true,
      sub: 'shortlist rate',
    },
    {
      label: 'Avg Match Score',
      value: data.avg_match_score,
      icon: TrendingUp,
      color: 'violet',
      trend: `${data.avg_match_score_change_pct >= 0 ? '+' : ''}${data.avg_match_score_change_pct}%`,
      up: data.avg_match_score_change_pct >= 0,
      sub: 'vs last cycle',
    },
  ];
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
        <div className="w-12 h-4 rounded bg-gray-100" />
      </div>
      <div className="w-16 h-8 rounded bg-gray-100 mb-1" />
      <div className="w-24 h-3 rounded bg-gray-100" />
    </div>
  );
}

function getStoredUserName(): string {
  try {
    const raw = localStorage.getItem('talentiq_user');
    if (raw) {
      const u = JSON.parse(raw) as { full_name?: string; email?: string };
      if (u.full_name) return u.full_name;
      if (u.email) {
        return u.email
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
      }
    }
  } catch { /* ignore */ }
  return '';
}

export function Dashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userName = getStoredUserName();

  useEffect(() => {
    const msg = sessionStorage.getItem('welcome_toast');
    if (msg) {
      sessionStorage.removeItem('welcome_toast');
      toast.success(msg);
    }
  }, []);

  useEffect(() => {
    getDashboardOverview()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kpiCards = data ? buildKpiCards(data) : [];
  const activityTrend = data?.weekly_activity ?? [];
  const pipelineData = (data?.pipeline ?? []).map((s) => ({
    ...s,
    color: PIPELINE_COLORS[s.stage] ?? '#94A3B8',
  }));
  const maxPipeline = Math.max(...pipelineData.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Welcome, {userName}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load dashboard data: {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpiCards.map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="p-5">
                  <div className="mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[kpi.color]}`}>
                      <kpi.icon size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary mb-1">
                    <AnimatedCounter target={kpi.value} />
                    {kpi.label === 'Avg Match Score' && '%'}
                  </p>
                  <p className="text-xs text-text-secondary font-medium">{kpi.label}</p>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Trend */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Activity</CardTitle>
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />Resumes
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Matches
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Shortlisted
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[200px] animate-pulse bg-gray-50 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={activityTrend}>
                  <defs>
                    <linearGradient id="resumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="shortlistedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="resumes" stroke="#2563EB" strokeWidth={2} fill="url(#resumeGrad)" />
                  <Area type="monotone" dataKey="matches" stroke="#10B981" strokeWidth={2} fill="url(#matchGrad)" />
                  <Area type="monotone" dataKey="shortlisted" stroke="#F59E0B" strokeWidth={2} fill="url(#shortlistedGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-20 h-3 rounded bg-gray-100" />
                    <div className="flex-1 h-2 rounded-full bg-gray-100" />
                    <div className="w-4 h-3 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {pipelineData.map((stage, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-20 flex-shrink-0">{stage.stage}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.count / maxPipeline) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-text-primary w-4">{stage.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
