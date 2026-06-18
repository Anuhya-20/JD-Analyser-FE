import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Eye, GitCompare, Star, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { mockCandidates } from '@/data/mockData';

const sorted = [...mockCandidates].sort((a, b) => b.matchScore - a.matchScore);

const medalColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
const rankLabels = ['Gold', 'Silver', 'Bronze'];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-emerald-100 text-emerald-700' : score >= 80 ? 'bg-blue-100 text-blue-700' : score >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center justify-center font-bold text-sm rounded-full px-3 py-1 ${color}`}>
      {score}%
    </span>
  );
}

export function MatchResults() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Candidate Ranking Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">AI-ranked candidates for Senior Full Stack Developer</p>
        </div>
        {selected.length >= 2 && (
          <Button onClick={() => navigate('/dashboard/comparison')} variant="secondary" className="gap-2">
            <GitCompare size={15} />
            Compare Selected ({selected.length})
          </Button>
        )}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sorted.slice(0, 3).map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
          >
            <Card hover className="border relative overflow-hidden">
              <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">{['#1', '#2', '#3'][i]}</div>
              <CardContent className="pt-5 pb-4">
                <div className="flex flex-col items-center text-center mb-3">
                  <Avatar initials={c.photo} size="lg" className="mb-2" />
                  <p className="font-semibold text-text-primary text-sm">{c.name}</p>
                  <p className="text-xs text-text-secondary">{c.role}</p>
                </div>
                <div className="flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-primary-600">
                    {c.matchScore}%
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-center">
                  <div className="bg-white/60 rounded-lg p-1.5">
                    <p className="text-xs font-bold text-text-primary">{c.skillScore}%</p>
                    <p className="text-xs text-text-secondary">Skills</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-1.5">
                    <p className="text-xs font-bold text-text-primary">{c.experienceScore}%</p>
                    <p className="text-xs text-text-secondary">Exp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Full Rankings Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Full Candidate Rankings</CardTitle>
          <p className="text-xs text-text-secondary">Select up to 3 to compare</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary w-8"></th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Rank</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Match Score</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Experience</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Skills</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Action</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border-b border-border last:border-0 hover:bg-gray-50 ${selected.includes(c.id) ? 'bg-primary-50/40' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="accent-primary-600 w-3.5 h-3.5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-text-secondary">
                          #{i + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={c.photo} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{c.name}</p>
                          <p className="text-xs text-text-secondary">{c.experience} yrs exp</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={c.matchScore} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={c.experienceScore} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={c.skillScore} />
                    </td>
                    
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/dashboard/candidates/${c.id}`)}
                        className="flex items-center gap-1.5 text-xs text-white font-medium px-3 py-1.5 rounded-lg btn-gradient transition-all"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
