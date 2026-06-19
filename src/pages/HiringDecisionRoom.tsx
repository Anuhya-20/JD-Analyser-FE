import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, CheckCircle, XCircle, Calendar, Eye,
  Shield, Sparkles, TrendingUp, AlertTriangle, Star,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { mockCandidates } from '@/data/mockData';

const top5 = [...mockCandidates].sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

type Decision = 'shortlisted' | 'interview' | 'rejected' | null;

export function HiringDecisionRoom() {
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [expanded, setExpanded] = useState<string | null>(top5[0].id);

  const decide = (id: string, decision: Decision) => {
    setDecisions(prev => ({ ...prev, [id]: prev[id] === decision ? null : decision }));
  };

  const riskColor = (risk: string) =>
    risk === 'Low' ? 'text-emerald-600 bg-emerald-50' : risk === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

  const confidenceColor = (pct: number) =>
    pct >= 88 ? 'text-emerald-600' : pct >= 75 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={22} className="text-amber-500" />
            <h1 className="text-2xl font-bold text-text-primary">AI Hiring Decision Room</h1>
          </div>
          <p className="text-text-secondary text-sm">Make final hiring decisions powered by AI analysis.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">{Object.values(decisions).filter(d => d === 'shortlisted').length} Shortlisted</Badge>
          <Badge variant="blue">{Object.values(decisions).filter(d => d === 'interview').length} Interview</Badge>
          <Badge variant="error">{Object.values(decisions).filter(d => d === 'rejected').length} Rejected</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {top5.map((c, i) => {
          const decision = decisions[c.id];
          const isExpanded = expanded === c.id;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`overflow-hidden transition-all duration-200 ${
                decision === 'shortlisted' ? 'ring-2 ring-emerald-400' :
                decision === 'interview' ? 'ring-2 ring-blue-400' :
                decision === 'rejected' ? 'ring-2 ring-red-300 opacity-60' : ''
              }`}>
                {/* Card Header */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : c.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <Avatar initials={c.photo} size="md" />
                      <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary text-sm">{c.name}</p>
                      <p className="text-xs text-text-secondary truncate">{c.role} &middot; {c.experience} yrs</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className={`text-lg font-bold ${confidenceColor(c.hiringConfidence)}`}>{c.hiringConfidence}%</p>
                      <p className="text-xs text-text-secondary">Confidence</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary-600">{c.matchScore}%</p>
                      <p className="text-xs text-text-secondary">Match</p>
                    </div>
                    <Badge className={riskColor(c.riskLevel)}>{c.riskLevel} Risk</Badge>
                  </div>

                  {/* Decision Buttons */}
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => decide(c.id, 'shortlisted')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        decision === 'shortlisted' ? 'btn-gradient text-white border-transparent' : 'border-border text-text-secondary hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                      <Star size={12} /> Shortlist
                    </button>
                    <button
                      onClick={() => decide(c.id, 'interview')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        decision === 'interview' ? 'btn-gradient text-white border-transparent' : 'border-border text-text-secondary hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Calendar size={12} /> Interview
                    </button>
                    <button
                      onClick={() => decide(c.id, 'rejected')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        decision === 'rejected' ? 'btn-gradient text-white border-transparent' : 'border-border text-text-secondary hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Score Grid */}
                        {[
                          { label: 'Technical Fit', value: c.technicalFit, icon: TrendingUp, color: '#2563EB' },
                          { label: 'Culture Fit', value: c.cultureFit, icon: Star, color: '#10B981' },
                          { label: 'Project Relevance', value: c.projectRelevance, icon: Trophy, color: '#F59E0B' },
                          { label: 'Risk Level', value: c.riskLevel, icon: AlertTriangle, color: c.riskLevel === 'Low' ? '#10B981' : c.riskLevel === 'Medium' ? '#F59E0B' : '#EF4444', isText: true },
                          { label: 'Hiring Confidence', value: c.hiringConfidence, icon: Shield, color: '#8B5CF6' },
                        ].map((metric, mi) => (
                          <div key={mi} className="bg-gray-50 rounded-xl p-3 text-center">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ backgroundColor: `${metric.color}15` }}>
                              <metric.icon size={14} style={{ color: metric.color }} />
                            </div>
                            {'isText' in metric && metric.isText
                              ? <p className="text-base font-bold" style={{ color: metric.color }}>{metric.value}</p>
                              : <p className="text-base font-bold text-text-primary">{metric.value}%</p>
                            }
                            <p className="text-xs text-text-secondary">{metric.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* AI Recommendation */}
                      <div className="mx-5 mb-5 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={14} className="text-primary-600" />
                          <p className="text-xs font-semibold text-primary-700">AI Recommendation</p>
                        </div>
                        <p className="text-sm text-text-primary leading-relaxed">{c.recommendation}</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/dashboard/candidates/${c.id}`)}>
                            <Eye size={12} /> View Analysis
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/interview')}>
                            Generate Interview Qs
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
