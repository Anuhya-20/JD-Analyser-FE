import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, CheckCircle2, XCircle,
  TrendingUp, Sparkles, Briefcase, GraduationCap,
  Star, Loader2, User,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { BASE_URL, authHeaders } from '@/lib/api';

interface CandidateRating {
  id: string;
  candidate_id?: string;
  candidate_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  current_title?: string;
  experience?: number;
  years_experience?: number;
  education?: string;
  match_score?: number;
  overall_score?: number;
  skill_score?: number;
  skills_score?: number;
  experience_score?: number;
  education_score?: number;
  recommendation?: string;
  strengths?: string[];
  weaknesses?: string[];
  areas_to_improve?: string[];
  matched_skills?: string[];
  missing_skills?: string[];
  skills?: string[];
  required_skills?: string[];
  ai_summary?: string;
  summary?: string;
  status?: string;
  risk_level?: string;
}

export function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jdId = searchParams.get('jd_id');

  const [candidate, setCandidate] = useState<CandidateRating | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<'idle' | 'accepting' | 'rejecting' | 'accepted' | 'rejected'>('idle');

  const handleDecision = async (decision: 'accepted' | 'rejected') => {
    if (!id) return;
    setActionStatus(decision === 'accepted' ? 'accepting' : 'rejecting');
    try {
      const res = await fetch(`${BASE_URL}/api/v1/candidates/${id}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setActionStatus(decision);
    } catch {
      setActionStatus('idle');
    }
  };

  useEffect(() => {
    if (!id || !jdId) {
      setError('Missing job description context. Please navigate from the Rankings page.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/api/v1/ratings/${jdId}/candidate/${id}`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<CandidateRating>; })
      .then(data => {
        setCandidate(data);
        const s = data.status?.toLowerCase();
        if (s === 'accepted' || s === 'rejected') setActionStatus(s);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, jdId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-32 text-text-secondary text-sm">
        <Loader2 size={20} className="animate-spin" /> Loading candidate profile...
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <User size={48} className="text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-text-primary mb-2">Profile Not Found</p>
        <p className="text-text-secondary text-sm mb-6">{error ?? 'The candidate profile could not be loaded.'}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const name         = candidate.candidate_name ?? candidate.name ?? '—';
  const role         = candidate.role ?? candidate.current_title ?? '';
  const matchScore   = candidate.match_score   ?? candidate.overall_score  ?? 0;
  const skillScore   = candidate.skill_score   ?? candidate.skills_score   ?? 0;
  const expScore     = candidate.experience_score ?? 0;
  const eduScore     = candidate.education_score  ?? 0;
  const years        = candidate.experience ?? candidate.years_experience;
  const strengths    = candidate.strengths  ?? [];
  const weaknesses   = candidate.weaknesses ?? candidate.areas_to_improve ?? [];
  const matchedSkills = candidate.matched_skills ?? candidate.skills ?? [];
  const missingSkills = candidate.missing_skills ?? [];
  const requiredSkills = candidate.required_skills ?? [];
  const aiSummary    = candidate.ai_summary ?? candidate.summary ?? '';

  const riskColor =
    candidate.risk_level?.toLowerCase() === 'low'    ? 'text-emerald-600 bg-emerald-50' :
    candidate.risk_level?.toLowerCase() === 'medium' ? 'text-amber-600 bg-amber-50'    :
    candidate.risk_level?.toLowerCase() === 'high'   ? 'text-red-600 bg-red-50'        : '';

  const scoreCards = [
    matchScore > 0 && { label: 'Overall Match', value: matchScore, color: 'text-primary-600', bg: 'bg-primary-50' },
    expScore   > 0 && { label: 'Experience',    value: expScore,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
    skillScore > 0 && { label: 'Skills',        value: skillScore, color: 'text-amber-600',   bg: 'bg-amber-50'   },
    eduScore   > 0 && { label: 'Education',     value: eduScore,   color: 'text-violet-600',  bg: 'bg-violet-50'  },
  ].filter(Boolean) as { label: string; value: number; color: string; bg: string }[];

  // Build unified skills list: required skills with matched/missing status
  const allSkills = requiredSkills.length > 0
    ? requiredSkills.map(s => ({ skill: s, matched: matchedSkills.map(m => m.toLowerCase()).includes(s.toLowerCase()) }))
    : [
        ...matchedSkills.map(s => ({ skill: s, matched: true })),
        ...missingSkills.map(s => ({ skill: s, matched: false })),
      ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back to Rankings
      </button>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <Avatar initials={name.slice(0, 2).toUpperCase()} size="xl" />
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{name}</h2>
                  {role && <p className="text-text-secondary text-sm">{role}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {candidate.email && (
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Mail size={12} /> {candidate.email}
                      </span>
                    )}
                    {candidate.phone && (
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Phone size={12} /> {candidate.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    {actionStatus === 'accepted' ? (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 size={15} /> Accepted
                      </span>
                    ) : actionStatus === 'rejected' ? (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                        <XCircle size={15} /> Rejected
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDecision('accepted')}
                          disabled={actionStatus === 'accepting' || actionStatus === 'rejecting'}
                          className="flex items-center gap-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-1.5 rounded-lg transition-colors"
                        >
                          {actionStatus === 'accepting' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecision('rejected')}
                          disabled={actionStatus === 'accepting' || actionStatus === 'rejecting'}
                          className="flex items-center gap-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-1.5 rounded-lg transition-colors"
                        >
                          {actionStatus === 'rejecting' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {candidate.risk_level && (
                      <Badge className={riskColor}>{candidate.risk_level} Risk</Badge>
                    )}
                    {candidate.recommendation && (
                      <Badge variant="outline">{candidate.recommendation}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Cards */}
      {scoreCards.length > 0 && (
        <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(scoreCards.length, 4)} gap-4`}>
          {scoreCards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="text-center p-4">
                <div className={`text-3xl font-bold ${card.color} mb-1`}>{card.value}%</div>
                <p className="text-xs text-text-secondary">{card.label}</p>
                <ProgressBar value={card.value} size="sm" className="mt-2" />
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Skills Match */}
      {allSkills.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Skills Match</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {allSkills.map(({ skill, matched }) => (
                <div key={skill} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm text-text-primary">{skill}</span>
                  {matched
                    ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 size={13} /> Matched</span>
                    : <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle size={13} /> Missing</span>
                  }
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Experience */}
        {years != null && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 py-3">
              <Briefcase size={15} className="text-primary-600" />
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-text-primary">
                {years} <span className="text-sm font-normal text-text-secondary">Years</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {candidate.education && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 py-3">
              <GraduationCap size={15} className="text-primary-600" />
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-text-primary">{candidate.education}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {strengths.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <TrendingUp size={15} className="text-emerald-600" />
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {weaknesses.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <Star size={15} className="text-amber-500" />
                <CardTitle>Areas to Improve</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                      <XCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" /> {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* AI Summary */}
      {aiSummary && (
        <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-100">
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <Sparkles size={15} className="text-primary-600" />
            <CardTitle>AI Recruiter Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-primary leading-relaxed italic">"{aiSummary}"</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => navigate('/dashboard/hiring-room')}>View in Decision Room</Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/interview')}>Generate Questions</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
