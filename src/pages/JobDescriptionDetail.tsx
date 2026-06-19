import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Briefcase, Building2, Users, Star,
  GraduationCap, Clock, Award,
  CheckCircle2, Layers, Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
  experience_level?: string;
  min_years_experience?: number | null;
  max_years_experience?: number | null;
  education_requirements?: string[] | string | null;
  required_skills?: string[];
  preferred_skills?: string[];
  certifications?: string[];
  responsibilities?: string[];
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
      <div>
        <button
          onClick={() => navigate('/dashboard/jobs')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to Job Descriptions
        </button>
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

          </CardContent>
        </Card>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23, duration: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                    <Layers size={14} className="text-violet-600" />
                  </div>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                        <CheckCircle2 size={13} className="text-violet-500 mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {(job.min_years_experience != null || job.education_requirements || (job.certifications && job.certifications.length > 0) || (job.required_skills && job.required_skills.length > 0) || (job.preferred_skills && job.preferred_skills.length > 0)) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <Award size={14} className="text-emerald-600" />
                  </div>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {job.min_years_experience != null && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-primary-600" />
                        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Experience</span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">
                        {job.min_years_experience}{job.max_years_experience != null ? `–${job.max_years_experience}` : '+'} Years
                      </p>
                      {job.experience_level && (
                        <p className="text-xs text-text-secondary mt-0.5">{job.experience_level}</p>
                      )}
                    </div>
                  )}

                  {(() => {
                    const edu = job.education_requirements;
                    const eduList = Array.isArray(edu) ? edu.filter(Boolean) : (edu ? [edu] : []);
                    return eduList.length > 0 ? (
                      <>
                        <div className="border-t border-border" />
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap size={14} className="text-violet-600" />
                            <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Education</span>
                          </div>
                          {eduList.map((e, i) => (
                            <p key={i} className="text-sm font-semibold text-text-primary">{e}</p>
                          ))}
                        </div>
                      </>
                    ) : null;
                  })()}

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

                  {job.required_skills && job.required_skills.length > 0 && (
                    <>
                      <div className="border-t border-border" />
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 size={14} className="text-primary-600" />
                          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Required Skills</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.map(skill => (
                            <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                              <CheckCircle2 size={11} /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
