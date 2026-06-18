import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, Star, TrendingUp, TrendingDown, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { pipelineData } from '@/data/mockData';


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

const kpiCards = [
  { label: 'Total Candidates', value: 10, icon: Users, color: 'blue', trend: '+12%', up: true, sub: 'vs last month' },
  { label: 'Active Jobs', value: 3, icon: Briefcase, color: 'emerald', trend: '+2', up: true, sub: 'new this week' },
  { label: 'Shortlisted', value: 4, icon: Star, color: 'amber', trend: '40%', up: true, sub: 'shortlist rate' },
  { label: 'Avg Match Score', value: 84, icon: TrendingUp, color: 'violet', trend: '+5%', up: true, sub: 'vs last cycle' },
];

const activityTrend = [
  { day: 'Mon', resumes: 2, matches: 1 },
  { day: 'Tue', resumes: 4, matches: 3 },
  { day: 'Wed', resumes: 3, matches: 2 },
  { day: 'Thu', resumes: 6, matches: 4 },
  { day: 'Fri', resumes: 8, matches: 6 },
  { day: 'Sat', resumes: 2, matches: 1 },
  { day: 'Sun', resumes: 5, matches: 4 },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
};

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">Welcome back, Niharika &middot; Senior Full Stack Developer role active</p>
        </div>  
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[kpi.color]}`}>
                  <kpi.icon size={18} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.trend}
                </span>
              </div>
              <p className="text-3xl font-bold text-text-primary mb-1">
                <AnimatedCounter target={kpi.value} />
                {kpi.label === 'Avg Match Score' && '%'}
              </p>
              <p className="text-xs text-text-secondary font-medium">{kpi.label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{kpi.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Activity Trend */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Activity</CardTitle>
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />Resumes</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Matches</span>
            </div>
          </CardHeader>
          <CardContent>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="resumes" stroke="#2563EB" strokeWidth={2} fill="url(#resumeGrad)" />
                <Area type="monotone" dataKey="matches" stroke="#10B981" strokeWidth={2} fill="url(#matchGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {pipelineData.map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-20 flex-shrink-0">{stage.stage}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.count / 10) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-text-primary w-4">{stage.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
