import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, CheckCircle2, TrendingUp,
  Users, Star, AlertTriangle, Trophy, BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { mockCandidates } from '@/data/mockData';

const sorted = [...mockCandidates].sort((a, b) => b.matchScore - a.matchScore);

export function Reports() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Recruiter Report</h1>
          <p className="text-text-secondary text-sm mt-0.5">Comprehensive analysis for Senior Full Stack Developer</p>
        </div>
        <Button onClick={handleDownload} loading={downloading} className="gap-2">
          <Download size={15} />
          {downloading ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      </div>

      {/* Report Content */}
      <div className="space-y-4 print:space-y-6" id="report-content">
        {/* Executive Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <FileText size={14} className="text-primary-600" />
            </div>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-primary leading-relaxed">
              This report analyzes <strong>10 candidates</strong> against the <strong>Senior Full Stack Developer</strong> role
              at TechCorp Solutions. AI-powered screening identified <strong>4 highly qualified candidates</strong> with match
              scores above 85%. The average match score across all candidates is <strong>84%</strong>, indicating a strong
              talent pool for this position.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Total Screened', value: '10', color: 'text-primary-600', bg: 'bg-primary-50' },
                { label: 'High Match (85%+)', value: '4', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Shortlisted', value: '4', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Avg Score', value: '84%', color: 'text-violet-600', bg: 'bg-violet-50' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-text-secondary">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Candidates */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <Trophy size={14} className="text-amber-600" />
            </div>
            <CardTitle>Top Candidates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sorted.slice(0, 3).map((c, i) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-700'}`}>{['#1', '#2', '#3'][i]}</span>
                <Avatar initials={c.photo} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-text-primary text-sm">{c.name}</p>
                  <p className="text-xs text-text-secondary">{c.role} · {c.experience} yrs</p>
                  <p className="text-xs text-text-secondary mt-0.5 italic">"{c.recommendation.slice(0, 50)}"</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">{c.matchScore}%</p>
                  <Badge variant="success" className="text-xs">Recommended</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Candidate Ranking Table */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
              <BarChart3 size={14} className="text-primary-600" />
            </div>
            <CardTitle>Full Candidate Ranking</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary">Rank</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary">Candidate</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary">Match</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary">Skills</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary">Experience</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-2.5 text-sm font-bold text-text-secondary">#{i + 1}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar initials={c.photo} size="sm" />
                        <span className="text-sm font-medium text-text-primary">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={c.matchScore} size="sm" className="w-16" />
                        <span className="text-xs font-semibold text-text-primary">{c.matchScore}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5"><span className="text-xs text-text-primary">{c.skillScore}%</span></td>
                    <td className="px-5 py-2.5"><span className="text-xs text-text-primary">{c.experience} yrs</span></td>
                    <td className="px-5 py-2.5">
                      <Badge variant={c.hiringConfidence >= 85 ? 'success' : c.hiringConfidence >= 75 ? 'warning' : 'error'}>
                        {c.hiringConfidence >= 85 ? 'Recommend' : c.hiringConfidence >= 75 ? 'Consider' : 'Hold'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </CardContent>
        </Card>

        {/* Skill Gap Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle size={14} className="text-red-600" />
            </div>
            <CardTitle>Skill Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">Most commonly missing skills across the candidate pool:</p>
            <div className="space-y-3">
              {[
                { skill: 'Kubernetes', gap: 60, note: 'Critical - 6/10 candidates missing' },
                { skill: 'Terraform', gap: 70, note: 'Important - 7/10 candidates missing' },
                { skill: 'GraphQL', gap: 50, note: 'Moderate - 5/10 candidates missing' },
                { skill: 'Redis', gap: 60, note: 'Moderate - 6/10 candidates missing' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-text-primary w-24 flex-shrink-0">{item.skill}</span>
                  <ProgressBar value={item.gap} size="sm" className="flex-1" color="#EF4444" />
                  <span className="text-xs text-text-secondary w-40 flex-shrink-0">{item.note}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interview Recommendations */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Star size={14} className="text-emerald-600" />
            </div>
            <CardTitle>Interview Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sorted.slice(0, 3).map((c, i) => (
                <div key={c.id} className="p-3 border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar initials={c.photo} size="sm" />
                    <span className="text-sm font-semibold text-text-primary">{c.name}</span>
                    <Badge variant="success" className="ml-auto text-xs">{c.matchScore}% Match</Badge>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{c.aiSummary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
