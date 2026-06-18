import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Briefcase, Building2, Users, Star,
  GraduationCap, Clock, Award, ChevronRight,
  CheckCircle2, Layers, Target, Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BASE_URL, authHeaders } from '@/lib/api';

interface JobDetail {
  id: string;
  title: string;
  company_name?: string;
  status?: string;
  is_active?: boolean;
  description_text?: string;
  department?: string;
  experience_required?: number;
  education_required?: string;
  required_skills?: string[];
  preferred_skills?: string[];
  certifications?: string[];
  candidates_count?: number;
  top_match?: number;
}

export function JobDescriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/api/v1/jobs/${id}`, { headers: authHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json() as Promise<JobDetail>;
      })
      .then(data => setJob(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-32 text-text-secondary text-sm">
        <Loader2 size={20} className="animate-spin" /> Loading job description...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Briefcase size={48} className="text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-text-primary mb-2">
          {error ? 'Failed to load' : 'Job Description Not Found'}
        </p>
        <p className="text-text-secondary text-sm mb-6">{error ?? 'The requested JD does not exist.'}</p>
        <Button onClick={() => navigate('/dashboard/jobs')}>Back to Job Descriptions</Button>
      </div>
    );
  }

  const departmentColor: Record<string, string> = {
    'Engineering':    'bg-blue-50 text-blue-700 border-blue-100',
    'Data & AI':      'bg-violet-50 text-violet-700 border-violet-100',
    'Infrastructure': 'bg-amber-50 text-amber-700 border-amber-100',
  };
  const deptClass = departmentColor[job.department ?? ''] ?? 'bg-gray-50 text-gray-600 border-gray-100';

  return (
    <div className="space-y-6">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/jobs')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to Job Descriptions
        </button>
        <Button onClick={() => navigate(`/dashboard/candidates?jd_id=${id}&tab=rankings`)} className="gap-2">
          View Match Results
          <ChevronRight size={15} />
        </Button>
      </div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Briefcase size={26} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-xl font-bold text-text-primary">{job.title}</h1>
                  {job.status && <Badge variant="success">{job.status}</Badge>}
                  {job.department && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${deptClass}`}>
                      {job.department}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                  {job.company_name && (
                    <span className="flex items-center gap-1.5">
                      <Building2 size={13} /> {job.company_name}
                    </span>
                  )}
                  {job.candidates_count != null && (
                    <span className="flex items-center gap-1.5">
                      <Users size={13} /> {job.candidates_count} candidates
                    </span>
                  )}
                  {job.top_match != null && (
                    <span className="flex items-center gap-1.5">
                      <Star size={13} className="text-amber-500" />
                      Top match: <span className="font-semibold text-emerald-600 ml-1">{job.top_match}%</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats strip */}
            {(job.experience_required != null || job.candidates_count != null || job.top_match != null) && (
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                {[
                  job.experience_required != null && { label: 'Experience Required', value: `${job.experience_required}+ years`, icon: Clock,  color: 'text-primary-600', bg: 'bg-primary-50' },
                  job.candidates_count   != null && { label: 'Total Candidates',     value: `${job.candidates_count} Applied`,   icon: Users,  color: 'text-violet-600',  bg: 'bg-violet-50'  },
                  job.top_match          != null && { label: 'Top Match Score',       value: `${job.top_match}%`,                 icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].filter(Boolean).map((item: any, i) => (
                  <div key={i} className={`${item.bg} rounded-xl p-4 flex items-center gap-3`}>
                    <div className={item.color}><item.icon size={20} /></div>
                    <div>
                      <p className="text-xs text-text-secondary">{item.label}</p>
                      <p className={`text-sm font-bold ${item.color} mt-0.5`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description */}
          {job.description_text && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Layers size={14} className="text-primary-600" />
                  </div>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{job.description_text}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Required Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13, duration: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-primary-600" />
                  </div>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                        <CheckCircle2 size={11} /> {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Preferred Skills */}
          {job.preferred_skills && job.preferred_skills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Star size={14} className="text-amber-600" />
                  </div>
                  <CardTitle>Preferred Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.preferred_skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                        <Star size={11} /> {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {(job.experience_required != null || job.education_required || (job.certifications && job.certifications.length > 0)) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <Award size={14} className="text-emerald-600" />
                  </div>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {job.experience_required != null && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-primary-600" />
                        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Experience</span>
                      </div>
                      <p className="text-sm font-bold text-text-primary">{job.experience_required}+ Years</p>
                      <p className="text-xs text-text-secondary mt-0.5">Professional experience required</p>
                    </div>
                  )}

                  {job.education_required && (
                    <>
                      <div className="border-t border-border" />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap size={14} className="text-violet-600" />
                          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Education</span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary">{job.education_required}</p>
                      </div>
                    </>
                  )}

                  {job.certifications && job.certifications.length > 0 && (
                    <>
                      <div className="border-t border-border" />
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
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <Card>
              <CardContent className="pt-4">
                <button
                  onClick={() => navigate(`/dashboard/candidates?jd_id=${id}&tab=rankings`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors border border-primary-100"
                >
                  View All Candidate Rankings
                  <ChevronRight size={13} />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
