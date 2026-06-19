import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { mockCandidates } from '@/data/mockData';
import { CheckCircle2, XCircle } from 'lucide-react';

const COLORS = ['#2563EB', '#10B981', '#F59E0B'];
const sorted = [...mockCandidates].sort((a, b) => b.matchScore - a.matchScore);
const requiredSkills = ['React', 'Python', 'AWS', 'PostgreSQL', 'Docker', 'TypeScript', 'Node.js', 'Kubernetes'];

export function CandidateComparison() {
  const [selected, setSelected] = useState([sorted[0].id, sorted[1].id, sorted[2].id]);

  const candidates = selected.map(id => mockCandidates.find(c => c.id === id)!).filter(Boolean);

  const radarData = [
    { subject: 'Technical', ...Object.fromEntries(candidates.map(c => [c.name.split(' ')[0], c.skillScore])) },
    { subject: 'Experience', ...Object.fromEntries(candidates.map(c => [c.name.split(' ')[0], c.experienceScore])) },
    { subject: 'Education', ...Object.fromEntries(candidates.map(c => [c.name.split(' ')[0], c.educationScore])) },
    { subject: 'Projects', ...Object.fromEntries(candidates.map(c => [c.name.split(' ')[0], c.projectScore])) },
    { subject: 'Certs', ...Object.fromEntries(candidates.map(c => [c.name.split(' ')[0], c.certificationScore])) },
    { subject: 'Communication', ...Object.fromEntries(candidates.map(c => [c.name.split(' ')[0], c.communicationScore])) },
  ];

  const metrics = [
    { label: 'Match Score', key: 'matchScore' as keyof typeof sorted[0] },
    { label: 'Experience Score', key: 'experienceScore' as keyof typeof sorted[0] },
    { label: 'Skill Score', key: 'skillScore' as keyof typeof sorted[0] },
    { label: 'Education Score', key: 'educationScore' as keyof typeof sorted[0] },
    { label: 'Hiring Confidence', key: 'hiringConfidence' as keyof typeof sorted[0] },
  ];

  const toggleCandidate = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.length > 1 ? prev.filter(x => x !== id) : prev;
      return prev.length < 3 ? [...prev, id] : [prev[1], prev[2], id];
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Candidate Comparison Center</h1>
        <p className="text-text-secondary text-sm mt-0.5">Side-by-side comparison of top candidates.</p>
      </div>

      {/* Candidate Selector */}
      <Card>
        <CardHeader><CardTitle>Select Candidates (up to 3)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sorted.slice(0, 6).map(c => (
              <button
                key={c.id}
                onClick={() => toggleCandidate(c.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  selected.includes(c.id) ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-border text-text-secondary hover:bg-gray-50'
                }`}
              >
                <Avatar initials={c.photo} size="sm" />
                {c.name} <span className="font-bold">{c.matchScore}%</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

            

      {/* Side by side comparison */}
      <div className="overflow-x-auto">
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(260px, 1fr))` }}>
        {candidates.map((c, ci) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}>
            <Card className={ci === 0 ? 'ring-2 ring-primary-200' : ''}>
              <CardContent className="pt-5">
                <div className="text-center mb-4">
                  <Avatar initials={c.photo} size="lg" className="mx-auto mb-2" />
                  <p className="font-semibold text-text-primary text-sm">{c.name}</p>
                  <p className="text-xs text-text-secondary">{c.experience} yrs &middot; {c.role}</p>
                  {ci === 0 && <Badge variant="success" className="mt-1 text-xs">Top Candidate</Badge>}
                </div>

                {/* Metric bars */}
                {metrics.map(m => (
                  <div key={m.key} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-text-secondary">{m.label}</span>
                      <span className="text-xs font-bold" style={{ color: COLORS[ci] }}>{c[m.key] as number}%</span>
                    </div>
                    <ProgressBar value={c[m.key] as number} size="sm" color={COLORS[ci]} />
                  </div>
                ))}

                {/* Skills */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-text-secondary mb-2">Key Skills</p>
                  <div className="space-y-1">
                    {requiredSkills.map(skill => {
                      const has = c.skills.includes(skill);
                      return (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="text-xs text-text-primary">{skill}</span>
                          {has
                            ? <CheckCircle2 size={12} className="text-emerald-500" />
                            : <XCircle size={12} className="text-red-400" />
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  );
}
