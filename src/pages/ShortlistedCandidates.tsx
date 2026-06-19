import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2, AlertTriangle, Briefcase, Star, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { BASE_URL, authHeaders } from '@/lib/api';

interface Job {
  id: string;
  title: string;
}

interface JobsResponse {
  items: Job[];
}

interface ShortlistedCandidate {
  candidate_profile_id: string;
  resume_id: string;
  full_name: string | null;
  email: string | null;
  location: string | null;
  total_years_experience: number;
  overall_score: number;
  rank: number;
  jd_id: string;
  job_title: string;
  company_name: string;
  status: string;
}

interface ShortlistedResponse {
  items: ShortlistedCandidate[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

function getInitials(name: string | null, email: string | null) {
  if (name) return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

export function ShortlistedCandidates() {
  const [jobs, setJobs]             = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [data, setData]       = useState<ShortlistedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Fetch job list
  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/jobs/titles?page=1&page_size=50`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<JobsResponse>; })
      .then(d => {
        const items = d.items ?? [];
        setJobs(items);
        if (items.length > 0) setSelectedJob(items[0]);
      })
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, []);

  // Fetch candidates when job changes
  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`${BASE_URL}/api/v1/candidates/${selectedJob.id}/accepted?page=1&page_size=50`, {
      headers: authHeaders(),
    })
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<ShortlistedResponse>; })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Shortlisted Candidates</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Shortlisted candidates for the selected job description.
          </p>
        </div>
        {data && (
          <Badge variant="success" className="text-sm px-3 py-1">
            {data.total} Shortlisted
          </Badge>
        )}
      </div>

      {/* Job dropdown */}
      <div className="relative w-full max-w-sm">
        <button
          onClick={() => setDropdownOpen(o => !o)}
          disabled={jobsLoading}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <span className="flex items-center gap-2 truncate">
            <Briefcase size={14} className="text-primary-600 flex-shrink-0" />
            {jobsLoading ? 'Loading jobs…' : selectedJob ? selectedJob.title : 'Select a job'}
          </span>
          <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
        )}
        {dropdownOpen && jobs.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => { setSelectedJob(job); setDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  selectedJob?.id === job.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-text-primary'
                }`}
              >
                {job.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle size={15} /> Failed to load shortlisted candidates: {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-24 text-text-secondary text-sm">
          <Loader2 size={20} className="animate-spin" /> Loading shortlisted candidates...
        </div>
      )}

      {/* No job selected */}
      {!selectedJob && !jobsLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users size={40} className="text-gray-300 mb-3" />
          <p className="text-sm font-medium text-text-primary">No shortlisted candidates found</p>
          <p className="text-xs text-text-secondary mt-1">Select a job description to view its shortlisted candidates.</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && selectedJob && data?.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users size={40} className="text-gray-300 mb-3" />
          <p className="text-sm font-medium text-text-primary">No shortlisted candidates found</p>
          <p className="text-xs text-text-secondary mt-1">No accepted candidates for <span className="font-semibold">{selectedJob.title}</span> yet.</p>
        </div>
      )}

      {/* Candidate Cards */}
      {!loading && data && data.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.items.map((c, i) => {
            const displayName = c.full_name || c.email || 'Unknown';
            const initials    = getInitials(c.full_name, c.email);
            const scoreColor  = c.overall_score >= 70 ? 'text-emerald-600' : c.overall_score >= 50 ? 'text-amber-600' : 'text-red-500';

            return (
              <motion.div
                key={c.candidate_profile_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover className="p-5">
                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar initials={initials} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
                      <p className="text-xs text-text-secondary truncate">{c.email}</p>
                    </div>
                    <span className="text-xs font-bold text-text-secondary bg-gray-100 rounded-full px-2 py-0.5 flex-shrink-0">
                      #{c.rank}
                    </span>
                  </div>

                  {/* Job info */}
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
                    <Briefcase size={12} className="flex-shrink-0" />
                    <span className="truncate capitalize">{c.job_title || selectedJob?.title}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className={`text-lg font-bold ${scoreColor}`}>
                        {c.overall_score.toFixed(1)}%
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">Match Score</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-text-primary">
                        {c.total_years_experience}
                        <span className="text-xs font-normal text-text-secondary ml-0.5">yrs</span>
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">Experience</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mt-3 flex justify-end">
                    <span className="flex items-center gap-1 text-xs font-medium text-white btn-gradient px-2.5 py-1 rounded-full">
                      <Star size={11} /> Shortlisted
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
