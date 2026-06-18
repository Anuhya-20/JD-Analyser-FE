import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, CheckCircle2, XCircle,
  TrendingUp, Sparkles, Briefcase, GraduationCap, Star,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { mockCandidates, requiredSkillsList } from '@/data/mockData';

export function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const candidate = mockCandidates.find(c => c.id === id) || mockCandidates[0];

  const overviewCards = [
    { label: 'Overall Match', value: candidate.matchScore, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Experience', value: candidate.experienceScore, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Skills', value: candidate.skillScore, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Education', value: candidate.educationScore, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  const riskColor = candidate.riskLevel === 'Low' ? 'text-emerald-600 bg-emerald-50' : candidate.riskLevel === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

  return (
    <div className="space-y-6">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft size={16} /> Back to Rankings
      </button>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <Avatar initials={candidate.photo} size="xl" />
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{candidate.name}</h2>
                  <p className="text-text-secondary text-sm">{candidate.role}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Mail size={12} /> {candidate.email}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Phone size={12} /> {candidate.phone}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={candidate.status === 'Shortlisted' ? 'success' : candidate.status === 'Interview' ? 'blue' : 'default'}>
                    {candidate.status}
                  </Badge>
                  <Badge className={riskColor}>{candidate.riskLevel} Risk</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="text-center p-4">
              <div className={`text-3xl font-bold ${card.color} mb-1`}>{card.value}%</div>
              <p className="text-xs text-text-secondary">{card.label}</p>
              <ProgressBar value={card.value} size="sm" className="mt-2" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Skills Match */}
      <div>
        <Card>
          <CardHeader><CardTitle>Skills Match</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requiredSkillsList.map(skill => {
                const has = candidate.skills.includes(skill);
                return (
                  <div key={skill} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-text-primary">{skill}</span>
                    {has
                      ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 size={13} /> Matched</span>
                      : <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle size={13} /> Missing</span>
                    }
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Experience */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <Briefcase size={15} className="text-primary-600" />
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-text-secondary mb-1">Required</p>
                <p className="text-2xl font-bold text-text-primary">5 <span className="text-sm font-normal text-text-secondary">Years</span></p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-xs text-text-secondary mb-1">Candidate</p>
                <p className={`text-2xl font-bold ${candidate.experience >= 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {candidate.experience} <span className="text-sm font-normal text-text-secondary">Years</span>
                </p>
              </div>
            </div>
            {candidate.experience >= 5 && (
              <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={12} /> Meets experience requirement
              </p>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <GraduationCap size={15} className="text-primary-600" />
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Required</p>
                <p className="text-sm font-medium text-text-primary">Bachelor's Degree in CS</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-0.5">Candidate</p>
                <p className="text-sm font-medium text-emerald-600">{candidate.education}</p>
              </div>
              <Badge variant="success" className="mt-1">Qualification Met</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <TrendingUp size={15} className="text-emerald-600" />
            <CardTitle>Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {candidate.strengths.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-text-primary">
                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 py-3">
            <Star size={15} className="text-amber-500" />
            <CardTitle>Areas to Improve</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {candidate.weaknesses.map((w, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-text-primary">
                  <XCircle size={13} className="text-amber-500 flex-shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-100">
        <CardHeader className="flex flex-row items-center gap-2 py-3">
          <Sparkles size={15} className="text-primary-600" />
          <CardTitle>AI Recruiter Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-primary leading-relaxed italic">"{candidate.aiSummary}"</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => navigate('/dashboard/hiring-room')}>View in Decision Room</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/interview')}>Generate Questions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
