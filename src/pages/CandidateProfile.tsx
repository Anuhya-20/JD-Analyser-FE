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
import { toast } from '@/components/ui/Toast';

interface CandidateRating {
  id: string;
  candidate_id?: string;
  full_name?: string | null;
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
  score_breakdown?: {
    skill_match?:         { score?: number; weight?: number; contribution?: number };
    experience?:          { score?: number; weight?: number; contribution?: number };
    education?:           { score?: number; weight?: number; contribution?: number };
    semantic_similarity?: { score?: number; weight?: number; contribution?: number };
    keyword_match?:       { score?: number; weight?: number; contribution?: number };
  };
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
      if (decision === 'accepted') toast.success('Candidate shortlisted successfully!');
      else toast.error('Candidate rejected.');
    } catch {
      setActionStatus('idle');
      toast.error('Action failed. Please try again.');
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

  const name         = candidate.full_name ?? candidate.candidate_name ?? candidate.name ?? '—';
  const role         = candidate.role ?? candidate.current_title ?? '';
  const sb           = candidate.score_breakdown;
  const matchScore   = candidate.match_score   ?? candidate.overall_score  ?? 0;
  const skillScore   = sb?.skill_match?.score  ?? candidate.skill_score ?? candidate.skills_score ?? 0;
  const expScore     = sb?.experience?.score   ?? candidate.experience_score ?? 0;
  const eduScore     = sb?.education?.score    ?? candidate.education_score  ?? 0;
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
    (sb?.skill_match != null || skillScore > 0) && { label: 'Skills Match', value: skillScore, color: 'text-amber-600', bg: 'bg-amber-50' },
    (sb?.education   != null || eduScore   > 0) && { label: 'Education',    value: eduScore,   color: 'text-violet-600', bg: 'bg-violet-50' },
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
            <Avatar initials={name !== '—' ? name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?' : '?'} size="xl" />
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
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-white btn-gradient px-3 py-1.5 rounded-lg">
                        <CheckCircle2 size={15} /> Shortlisted
                      </span>
                    ) : actionStatus === 'rejected' ? (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-white btn-gradient px-3 py-1.5 rounded-lg opacity-60">
                        <XCircle size={15} /> Rejected
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDecision('accepted')}
                          disabled={actionStatus === 'accepting' || actionStatus === 'rejecting'}
                          className="flex items-center gap-1.5 text-sm font-medium text-white btn-gradient disabled:opacity-50 px-4 py-1.5 rounded-lg transition-colors"
                        >
                          {actionStatus === 'accepting' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleDecision('rejected')}
                          disabled={actionStatus === 'accepting' || actionStatus === 'rejecting'}
                          className="flex items-center gap-1.5 text-sm font-medium text-white btn-gradient disabled:opacity-50 px-4 py-1.5 rounded-lg transition-colors"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          <CardContent className="space-y-4">
            {allSkills.some(s => s.matched) && (
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Matched</p>
                <div className="flex flex-wrap gap-2">
                  {allSkills.filter(s => s.matched).map(({ skill }) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={11} /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {allSkills.some(s => !s.matched) && (
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Missing</p>
                <div className="flex flex-wrap gap-2">
                  {allSkills.filter(s => !s.matched).map(({ skill }) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                      <XCircle size={11} /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
