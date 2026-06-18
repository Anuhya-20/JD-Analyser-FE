import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Briefcase, Building2, Users, Star,
  GraduationCap, Clock, Award, ChevronRight,
  CheckCircle2, Layers, Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { mockJobs } from '@/data/mockData';

export function JobDescriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const job = mockJobs.find(j => j.id === id);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Briefcase size={48} className="text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-text-primary mb-2">Job Description Not Found</p>
        <p className="text-text-secondary text-sm mb-6">The requested JD does not exist.</p>
        <Button onClick={() => navigate('/dashboard/jobs')}>Back to Job Descriptions</Button>
      </div>
    );
  }

  const departmentColor: Record<string, string> = {
    'Engineering':   'bg-blue-50 text-blue-700 border-blue-100',
    'Data & AI':     'bg-violet-50 text-violet-700 border-violet-100',
    'Infrastructure':'bg-amber-50 text-amber-700 border-amber-100',
  };
  const deptClass = departmentColor[job.department] ?? 'bg-gray-50 text-gray-600 border-gray-100';

  return (
    <div className="space-y-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/jobs')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to Job Descriptions
        </button>
        <Button
          onClick={() => navigate('/dashboard/rankings')}
          className="gap-2"
        >
          View Match Results
          <ChevronRight size={15} />
        </Button>
      </div>

      {/* ── Hero card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              {/* Icon */}
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Briefcase size={26} className="text-primary-600" />
              </div>

              {/* Title block */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-xl font-bold text-text-primary">{job.title}</h1>
                  <Badge variant="success">{job.status}</Badge>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${deptClass}`}>
                    {job.department}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {job.candidates} candidates
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star size={13} className="text-amber-500" />
                    Top match: <span className="font-semibold text-emerald-600 ml-1">{job.topMatch}%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              {[
                { label: 'Experience Required', value: `${job.experienceRequired}+ years`,   icon: Clock,          color: 'text-primary-600', bg: 'bg-primary-50' },
                { label: 'Total Candidates',    value: `${job.candidates} Applied`,           icon: Users,          color: 'text-violet-600',  bg: 'bg-violet-50'  },
                { label: 'Top Match Score',     value: `${job.topMatch}%`,                    icon: Target,         color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map(({ label, value, icon: Icon, color, bg }, i) => (
                <div key={i} className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
                  <div className={`${color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">{label}</p>
                    <p className={`text-sm font-bold ${color} mt-0.5`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column (description + skills) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Layers size={14} className="text-primary-600" />
                </div>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-primary leading-relaxed">{job.description}</p>
                <p className="text-sm text-text-secondary leading-relaxed mt-3">
                  The ideal candidate will have a proven track record of delivering high-quality software, strong
                  communication skills, and the ability to collaborate effectively in a cross-functional team
                  environment. You will be expected to mentor junior engineers, participate in architecture
                  discussions, and contribute to our engineering culture.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Required Skills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13, duration: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-primary-600" />
                </div>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100"
                    >
                      <CheckCircle2 size={11} />
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferred Skills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Star size={14} className="text-amber-600" />
                </div>
                <CardTitle>Preferred Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.preferredSkills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100"
                    >
                      <Star size={11} />
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column (requirements) */}
        <div className="space-y-5">

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Award size={14} className="text-emerald-600" />
                </div>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Experience */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-primary-600" />
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Experience</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{job.experienceRequired}+ Years</p>
                  <p className="text-xs text-text-secondary mt-0.5">Professional experience required</p>
                </div>

                <div className="border-t border-border" />

                {/* Education */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap size={14} className="text-violet-600" />
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Education</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{job.educationRequired}</p>
                </div>

                <div className="border-t border-border" />

                {/* Certifications */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={14} className="text-amber-600" />
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Certifications</span>
                  </div>
                  <div className="space-y-2">
                    {job.certifications.map(cert => (
                      <div key={cert} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-text-secondary leading-relaxed">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Match Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Target size={14} className="text-violet-600" />
                </div>
                <CardTitle>AI Match Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Top Candidate Match', value: job.topMatch,          color: '#10B981' },
                  { label: 'Avg. Skill Coverage',  value: Math.round(job.topMatch * 0.88), color: '#2563EB' },
                  { label: 'Pool Readiness',        value: Math.round(job.topMatch * 0.82), color: '#F59E0B' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-secondary font-medium">{label}</span>
                      <span className="font-bold" style={{ color }}>{value}%</span>
                    </div>
                    <ProgressBar value={value} size="sm" color={color} />
                  </div>
                ))}

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/dashboard/rankings')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors border border-primary-100"
                  >
                    View All Candidate Rankings
                    <ChevronRight size={13} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
