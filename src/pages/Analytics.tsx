import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, BarChart3, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BASE_URL, authHeaders } from '@/lib/api';
import {
  analyticsApi,
  type ScoreDistribution,
  type ScoreComponents,
  type RecommendationBreakdown,
  type SkillAnalysis,
  type CandidateTiers,
  type ExperienceDistribution,
} from '@/services/analytics';

const GRADIENT_COLORS = ['#0A6CCB', '#1D8AD8', '#5CC8F5', '#3B82F6', '#60A5FA', '#93C5FD'];
const TOOLTIP_STYLE = { border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' };

interface JD { id: string; title: string }

interface AnalyticsData {
  scoreDistribution:       ScoreDistribution;
  scoreComponents:         ScoreComponents;
  recommendationBreakdown: RecommendationBreakdown;
  skillAnalysis:           SkillAnalysis;
  candidateTiers:          CandidateTiers;
  experienceDistribution:  ExperienceDistribution;
}

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return <div className="animate-pulse bg-gray-50 rounded-lg" style={{ height }} />;
}

function StatBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </div>
  );
}

export function Analytics() {
  const [jds, setJds]           = useState<JD[]>([]);
  const [selectedJD, setSelectedJD] = useState<JD | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [data, setData]         = useState<AnalyticsData | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  /* Fetch JD list */
  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/jobs/titles?page=1&page_size=100`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: unknown) => {
        const list: JD[] = Array.isArray(data) ? data : ((data as { items?: JD[]; data?: JD[] }).items ?? (data as { data?: JD[] }).data ?? []);
        setJds(list);
        if (list.length > 0) setSelectedJD(list[0]);
      })
      .catch(() => {});
  }, []);

  /* Fetch all analytics when JD changes */
  useEffect(() => {
    if (!selectedJD) return;
    setLoading(true);
    setError(null);
    setData(null);

    Promise.all([
      analyticsApi.scoreDistribution(selectedJD.id),
      analyticsApi.scoreComponents(selectedJD.id),
      analyticsApi.recommendationBreakdown(selectedJD.id),
      analyticsApi.skillAnalysis(selectedJD.id),
      analyticsApi.candidateTiers(selectedJD.id),
      analyticsApi.experienceDistribution(selectedJD.id),
    ])
      .then(([scoreDistribution, scoreComponents, recommendationBreakdown, skillAnalysis, candidateTiers, experienceDistribution]) => {
        setData({ scoreDistribution, scoreComponents, recommendationBreakdown, skillAnalysis, candidateTiers, experienceDistribution });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedJD]);

  const jdLabel = selectedJD ? (selectedJD.title || selectedJD.id) : 'Select Job Description';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary text-sm mt-0.5">Data-driven insights for your recruitment pipeline.</p>
        </div>

        {/* JD Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors min-w-[220px] justify-between shadow-sm"
          >
            <span className="truncate">{jdLabel}</span>
            <ChevronDown size={15} className={`flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-72 bg-white border border-border rounded-xl shadow-lg z-20 overflow-hidden max-h-64 overflow-y-auto">
                {jds.length === 0 ? (
                  <p className="text-sm text-text-secondary p-4 text-center">No job descriptions found</p>
                ) : jds.map(jd => (
                  <button
                    key={jd.id}
                    onClick={() => { setSelectedJD(jd); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${selectedJD?.id === jd.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-text-primary'}`}
                  >
                    {jd.title || jd.id}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle size={15} /> Failed to load analytics: {error}
        </div>
      )}

      {!selectedJD && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 size={40} className="text-gray-300 mb-3" />
          <p className="text-text-secondary text-sm">Select a job description to view analytics</p>
        </div>
      )}

      {selectedJD && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* 1 — Score Distribution */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Score Distribution</CardTitle>
                {data && (
                  <div className="flex items-center gap-3">
                    <StatBadge label="Total" value={data.scoreDistribution.total_candidates} color="#2563EB" />
                    <StatBadge label="Avg Score" value={`${data.scoreDistribution.avg_score.toFixed(1)}%`} color="#10B981" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : data ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.scoreDistribution.ranges ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [v, n === 'count' ? 'Candidates' : 'Percentage']} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {(data.scoreDistribution.ranges ?? []).map((_, i) => (
                          <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          {/* 2 — Score Components */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Score Components</CardTitle>
                {data && (
                  <StatBadge label="Overall Avg" value={`${data.scoreComponents.overall_average.toFixed(1)}%`} color="#2563EB" />
                )}
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : data ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.scoreComponents.components ?? []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="average" name="Average" fill="#2563EB" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="maximum" name="Maximum" fill="#5CC8F5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          {/* 3 — Recommendation Breakdown */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Recommendation Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                {loading ? <ChartSkeleton /> : data ? (
                  <>
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart>
                        <Pie
                          data={data.recommendationBreakdown.levels ?? []}
                          dataKey="count"
                          nameKey="label"
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={78}
                        >
                          {(data.recommendationBreakdown.levels ?? []).map((_, i) => (
                            <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {(data.recommendationBreakdown.levels ?? []).map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: GRADIENT_COLORS[i % GRADIENT_COLORS.length] }} />
                          <span className="text-xs text-text-secondary flex-1 truncate">{l.label}</span>
                          <span className="text-xs font-semibold text-text-primary">{l.count}</span>
                          <span className="text-xs text-text-secondary">({l.percentage}%)</span>
                        </div>
                      ))}
                      <p className="text-xs text-text-secondary pt-1 border-t border-border mt-2">
                        Total: <strong className="text-text-primary">{data.recommendationBreakdown.total}</strong>
                      </p>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          {/* 4 — Candidate Tiers */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle>Candidate Tiers</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                {loading ? <ChartSkeleton /> : data ? (
                  <>
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart>
                        <Pie
                          data={data.candidateTiers.tiers ?? []}
                          dataKey="count"
                          nameKey="label"
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={78}
                        >
                          {(data.candidateTiers.tiers ?? []).map((_, i) => (
                            <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {(data.candidateTiers.tiers ?? []).map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: GRADIENT_COLORS[i % GRADIENT_COLORS.length] }} />
                          <span className="text-xs text-text-secondary flex-1 truncate">{t.label}</span>
                          <span className="text-xs font-semibold text-text-primary">{t.count}</span>
                          <span className="text-xs text-text-secondary">({t.percentage}%)</span>
                        </div>
                      ))}
                      <p className="text-xs text-text-secondary pt-1 border-t border-border mt-2">
                        Total: <strong className="text-text-primary">{data.candidateTiers.total}</strong>
                      </p>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          {/* 5 — Experience Distribution */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Experience Distribution</CardTitle>
                {data && (
                  <StatBadge label="Avg Exp" value={`${data.experienceDistribution.avg_years.toFixed(1)} yrs`} color="#8B5CF6" />
                )}
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton /> : data ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.experienceDistribution.buckets ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, 'Candidates']} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {(data.experienceDistribution.buckets ?? []).map((_: unknown, i: number) => (
                          <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          {/* 6 — Skill Analysis (full width) */}
          <motion.div className="xl:col-span-2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Skill Analysis</CardTitle>
                {data && (
                  <div className="flex items-center gap-3">
                    <StatBadge label="Avg Matched" value={data.skillAnalysis.avg_matched_count.toFixed(1)} color="#10B981" />
                    <StatBadge label="Avg Missing" value={data.skillAnalysis.avg_missing_count.toFixed(1)} color="#EF4444" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loading ? <ChartSkeleton height={260} /> : data ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top matched */}
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-3">
                        Top Matched Skills
                      </p>
                      {data.skillAnalysis.top_matched_skills.length === 0 ? (
                        <p className="text-xs text-text-secondary italic py-4">No matched skills data available.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {data.skillAnalysis.top_matched_skills.slice(0, 8).map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-text-primary w-36 flex-shrink-0 truncate">{s.skill}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${s.percentage}%` }}
                                  transition={{ delay: i * 0.05, duration: 0.5 }}
                                  className="h-full rounded-full bg-emerald-500"
                                />
                              </div>
                              <span className="text-xs text-text-secondary w-16 text-right flex-shrink-0">
                                {s.candidate_count} ({s.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top missing */}
                    <div>
                      <p className="text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full inline-block mb-3">
                        Top Missing Skills
                      </p>
                      {data.skillAnalysis.top_missing_skills.length === 0 ? (
                        <p className="text-xs text-text-secondary italic py-4">No missing skills data available.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {data.skillAnalysis.top_missing_skills.slice(0, 8).map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-text-primary w-36 flex-shrink-0 truncate">{s.skill}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${s.percentage}%` }}
                                  transition={{ delay: i * 0.05, duration: 0.5 }}
                                  className="h-full rounded-full bg-red-400"
                                />
                              </div>
                              <span className="text-xs text-text-secondary w-16 text-right flex-shrink-0">
                                {s.candidate_count} ({s.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      )}
    </div>
  );
}
