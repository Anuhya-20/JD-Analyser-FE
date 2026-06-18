import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  matchScoreDistribution, skillDistribution, pipelineData,
  missingSkills, experienceBreakdown,
} from '@/data/mockData';

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
const hiringReadinessData = [
  { subject: 'Skill Coverage', value: 78 },
  { subject: 'Exp. Match', value: 82 },
  { subject: 'Edu. Fit', value: 90 },
  { subject: 'Availability', value: 70 },
  { subject: 'Cert. Match', value: 65 },
  { subject: 'Culture', value: 85 },
];

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-secondary text-sm mt-0.5">Data-driven insights for your recruitment pipeline.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Match Score Distribution */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader><CardTitle>Match Score Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={matchScoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skill Distribution */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle>Skill Distribution Among Candidates</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={skillDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="skill" type="category" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hiring Funnel */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader><CardTitle>Hiring Funnel</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pipelineData.map((stage, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-24 flex-shrink-0">{stage.stage}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.count / pipelineData[0].count) * 100}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.7 }}
                        className="h-full rounded-full flex items-center px-2"
                        style={{ backgroundColor: stage.color }}
                      >
                        <span className="text-white text-xs font-semibold">{stage.count}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Missing Skills */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle>Top Missing Skills</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={missingSkills}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="skill" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Experience Breakdown */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader><CardTitle>Candidate Experience Breakdown</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={experienceBreakdown} dataKey="count" nameKey="range" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {experienceBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {experienceBreakdown.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-text-secondary">{d.range}</span>
                    <span className="text-xs font-semibold text-text-primary ml-auto">{d.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hiring Readiness Radar */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle>Hiring Readiness Score</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={hiringReadinessData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Radar dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} strokeWidth={2} />
                  <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
