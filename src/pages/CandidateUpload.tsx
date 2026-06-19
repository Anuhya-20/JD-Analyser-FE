import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Upload, FileText, Brain,
  CheckCircle2, AlertCircle, Clock, X,
  ChevronDown, Briefcase, Search, Loader2, Send,
  Trophy, Eye, Users, ArrowLeft,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { BASE_URL, authHeaders } from '@/lib/api';

interface Rating {
  id: string;
  rank?: number;
  full_name?: string;
  candidate_name?: string;
  name?: string;
  email?: string;
  overall_score?: number;
  match_score?: number;
  experience_score?: number;
  skill_match_score?: number;
  skill_score?: number;
  skills_score?: number;
  total_years_experience?: number;
  years_experience?: number;
  recommendation_level?: string;
  recommendation?: string;
  candidate_id?: string;
  candidate_profile_id?: string;
}

interface Job { id: string; title: string; }

interface ProcessingStatus {
  status: string;
  total_resumes: number;
  progress_percentage: number;
  parsed: number;
  profiled: number;
  matched: number;
  ranked: number;
  failed: number;
}

interface Resume {
  id: string;
  filename?: string;
  candidate_name?: string;
  name?: string;
  email?: string;
  status?: string;
  created_at?: string;
  match_score?: number;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
}

const PAGE_SIZE = 20;

async function fetchTitles(page: number, search: string): Promise<Job[]> {
  try {
    const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
    if (search) params.set('search', search);
    const res = await fetch(`${BASE_URL}/api/v1/jobs/titles?${params}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items ?? data.data ?? []);
  } catch {
    return [];
  }
}

export function CandidateUpload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'upload' | 'rankings'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedJD, setSelectedJD] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [processingData, setProcessingData] = useState<ProcessingStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const selectedJdIdRef = useRef<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchResumes = useCallback(async (jdId: string) => {
    setResumesLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/resumes/${jdId}`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResumes(Array.isArray(data) ? data : (data.items ?? data.data ?? []));
    } catch {
      setResumes([]);
    } finally {
      setResumesLoading(false);
    }
  }, []);

  const startPolling = useCallback((jdId: string) => {
    clearInterval(pollIntervalRef.current);
    setIsPolling(true);
    setProcessingData(null);

    const poll = async () => {
      if (selectedJdIdRef.current !== jdId) { clearInterval(pollIntervalRef.current); return; }
      try {
        const res = await fetch(`${BASE_URL}/api/v1/dashboard/${jdId}/status`, { headers: authHeaders() });
        if (!res.ok) return;
        const data: ProcessingStatus = await res.json();
        setProcessingData(data);
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          setIsPolling(false);
          if (data.status === 'completed') fetchResumes(jdId);
        }
      } catch { /* keep polling */ }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, 3000);
  }, [fetchResumes]);

  // Auto-select JD and switch tab from URL params (e.g. ?jd_id=xxx&tab=rankings)
  useEffect(() => {
    const jdId  = searchParams.get('jd_id');
    const tab   = searchParams.get('tab');
    if (!jdId) return;
    if (tab === 'rankings') setActiveTab('rankings');
    fetch(`${BASE_URL}/api/v1/jobs/${jdId}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then((job: Job | null) => { if (job) setSelectedJD(job); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch ratings when switching to rankings tab or when JD changes on rankings tab
  useEffect(() => {
    if (activeTab !== 'rankings' || !selectedJD) { setRatings([]); return; }
    setRatingsLoading(true);
    fetch(`${BASE_URL}/api/v1/ratings/${selectedJD.id}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setRatings(Array.isArray(data) ? data : (data.items ?? data.data ?? [])))
      .catch(() => setRatings([]))
      .finally(() => setRatingsLoading(false));
  }, [activeTab, selectedJD]);

  // When a JD is selected, check its status first
  useEffect(() => {
    selectedJdIdRef.current = selectedJD?.id ?? null;
    clearInterval(pollIntervalRef.current);
    setIsPolling(false);
    setProcessingData(null);
    setResumes([]);
    if (!selectedJD) return;

    fetch(`${BASE_URL}/api/v1/dashboard/${selectedJD.id}/status`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then((data: ProcessingStatus | null) => {
        if (!data) { fetchResumes(selectedJD.id); return; }
        setProcessingData(data);
        if (data.status === 'completed') fetchResumes(selectedJD.id);
        else startPolling(selectedJD.id);
      })
      .catch(() => fetchResumes(selectedJD.id));
  }, [selectedJD, fetchResumes, startPolling]);

  // Cleanup interval on unmount
  useEffect(() => () => clearInterval(pollIntervalRef.current), []);

  // ── Dropdown ────────────────────────────────────────────────────────────────
  const [ddJobs, setDdJobs] = useState<Job[]>([]);
  const [ddLoading, setDdLoading] = useState(false);
  const ddInitialized = useRef(false);

  useEffect(() => {
    if (!dropdownOpen || ddInitialized.current) return;
    ddInitialized.current = true;
    setDdLoading(true);
    fetchTitles(1, '').then(list => {
      setDdJobs(list);
      setDdLoading(false);
    });
  }, [dropdownOpen]);

  // ── Modal ───────────────────────────────────────────────────────────────────
  const [modalJobs, setModalJobs]         = useState<Job[]>([]);
  const [modalSearch, setModalSearch]     = useState('');
  const [modalFetching, setModalFetching] = useState(false);
  const [modalHasMore, setModalHasMore]   = useState(true);

  const modalPageRef     = useRef(1);
  const modalHasMoreRef  = useRef(true);
  const modalSearchRef   = useRef('');
  const modalFetchingRef = useRef(false);
  const modalListRef     = useRef<HTMLDivElement>(null);
  const modalSearchTimer = useRef<ReturnType<typeof setTimeout>>();

  const doModalFetch = useCallback(async (pg: number, search: string, reset: boolean) => {
    if (modalFetchingRef.current) return;
    modalFetchingRef.current = true;
    setModalFetching(true);
    const list = await fetchTitles(pg, search);
    const more = list.length === PAGE_SIZE;
    modalHasMoreRef.current = more;
    setModalHasMore(more);
    setModalJobs(prev => reset ? list : [...prev, ...list]);
    modalFetchingRef.current = false;
    setModalFetching(false);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    modalPageRef.current    = 1;
    modalHasMoreRef.current = true;
    modalSearchRef.current  = '';
    setModalSearch('');
    setModalJobs([]);
    setModalHasMore(true);
    doModalFetch(1, '', true);
  }, [modalOpen, doModalFetch]);

  const handleModalSearch = useCallback((val: string) => {
    setModalSearch(val);
    modalSearchRef.current = val;
    clearTimeout(modalSearchTimer.current);
    modalSearchTimer.current = setTimeout(() => {
      modalPageRef.current    = 1;
      modalHasMoreRef.current = true;
      setModalJobs([]);
      setModalHasMore(true);
      doModalFetch(1, val, true);
    }, 350);
  }, [doModalFetch]);

  const handleModalScroll = useCallback(() => {
    const el = modalListRef.current;
    if (!el || modalFetchingRef.current || !modalHasMoreRef.current) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      const next = modalPageRef.current + 1;
      modalPageRef.current = next;
      doModalFetch(next, modalSearchRef.current, false);
    }
  }, [doModalFetch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Dropzone ────────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: UploadedFile[] = accepted.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      name: f.name,
      size: f.size,
      progress: 0,
      status: 'uploading',
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setSubmitted(false);

    newFiles.forEach(f => {
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 25;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
          setUploadedFiles(prev =>
            prev.map(uf => uf.id === f.id ? { ...uf, progress: 100, status: 'done' } : uf)
          );
        } else {
          setUploadedFiles(prev =>
            prev.map(uf => uf.id === f.id ? { ...uf, progress: Math.round(prog) } : uf)
          );
        }
      }, 200);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: true,
  });

  const removeFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  function handleSelectJD(jd: Job) {
    setSelectedJD(jd);
    setDropdownOpen(false);
    setModalOpen(false);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const doneFiles   = uploadedFiles.filter(f => f.status === 'done');
  const allDone     = uploadedFiles.length > 0 && uploadedFiles.every(f => f.status !== 'uploading');
  const canSubmit   = !!selectedJD && doneFiles.length > 0 && allDone;

  const handleSubmit = async () => {
    if (!selectedJD || doneFiles.length === 0) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      doneFiles.forEach(uf => formData.append('files', uf.file));
      const res = await fetch(
        `${BASE_URL}/api/v1/resumes/${selectedJD.id}/upload?auto_process=true`,
        { method: 'POST', headers: authHeaders(), body: formData }
      );
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error ${res.status}`);
      }
      setSubmitted(true);
      setUploadedFiles([]);
      startPolling(selectedJD.id);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingName  = (r: Rating) => r.full_name ?? r.candidate_name ?? r.name ?? '—';
  const getRatingScore = (r: Rating) => r.overall_score ?? r.match_score ?? 0;
  const getRatingCandId = (r: Rating) => r.candidate_id ?? r.candidate_profile_id ?? r.id;
  const sortedRatings  = [...ratings].sort((a, b) => getRatingScore(b) - getRatingScore(a));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {activeTab === 'rankings' && (
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-2"
            >
              <ArrowLeft size={15} /> Back to Job Descriptions
            </button>
          )}
          <h1 className="text-2xl font-bold text-text-primary">Candidates</h1>
          <p className="text-text-secondary text-sm mt-0.5">Upload resumes and view rankings for a job description.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex rounded-lg border border-border p-1 bg-gray-50">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'upload' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary'}`}
            >
              <Upload size={13} /> Upload
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'rankings' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary'}`}
            >
              <Trophy size={13} /> Rankings
            </button>
          </div>

          {/* JD Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[220px] justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Briefcase size={14} className="text-primary-600 flex-shrink-0" />
                <span className="truncate text-text-primary">
                  {selectedJD ? selectedJD.title : 'Select Job Description'}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-text-secondary flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-[300px] bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-border bg-gray-50">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                      Job Descriptions
                    </p>
                  </div>

                  <div className="py-1 max-h-[220px] overflow-y-auto">
                    {ddLoading ? (
                      <div className="flex items-center justify-center gap-2 py-5 text-text-secondary text-xs">
                        <Loader2 size={13} className="animate-spin" /> Loading...
                      </div>
                    ) : ddJobs.length === 0 ? (
                      <p className="text-xs text-center py-5 text-text-secondary">No jobs found</p>
                    ) : (
                      ddJobs.map(jd => (
                        <button
                          key={jd.id}
                          onClick={() => handleSelectJD(jd)}
                          className={`w-full text-left px-3 py-2.5 hover:bg-primary-50 transition-colors flex items-center justify-between gap-2 ${
                            selectedJD?.id === jd.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <span className="text-sm font-medium text-text-primary truncate">{jd.title}</span>
                          {selectedJD?.id === jd.id && <CheckCircle2 size={13} className="text-primary-600 flex-shrink-0" />}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="border-t border-border">
                    <button
                      onClick={() => { setDropdownOpen(false); setModalOpen(true); }}
                      className="w-full px-3 py-2.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors text-center"
                    >
                      View More
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button onClick={() => navigate('/dashboard/ai-processing')} className="gap-2">
            <Brain size={15} />
            Analyze All
          </Button>
        </div>
      </div>

      {/* Selected JD Banner */}
      <AnimatePresence>
        {selectedJD && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl">
              <Briefcase size={16} className="text-primary-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-800 truncate">{selectedJD.title}</p>
              </div>
              <Badge variant="success">Selected</Badge>
              <button
                onClick={() => setSelectedJD(null)}
                className="p-1 rounded hover:bg-primary-100 text-primary-500 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success banner */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl"
          >
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-800">Resumes submitted successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rankings Tab ──────────────────────────────────────────── */}
      {activeTab === 'rankings' && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            <CardTitle>{selectedJD ? `Rankings — ${selectedJD.title}` : 'Select a job description to view rankings'}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedJD ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
                <Briefcase size={40} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">Select a job description above</p>
              </div>
            ) : ratingsLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-text-secondary text-sm">
                <Loader2 size={18} className="animate-spin" /> Loading rankings…
              </div>
            ) : sortedRatings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
                <Users size={40} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">No rankings yet for this job</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Rank</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Candidate</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Overall Score</th>
                      {sortedRatings.some(r => (r.experience_score ?? 0) > 0) && (
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Experience</th>
                      )}
                      {sortedRatings.some(r => (r.skill_match_score ?? r.skill_score ?? r.skills_score ?? 0) > 0) && (
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Skills</th>
                      )}
                      {sortedRatings.some(r => r.recommendation_level ?? r.recommendation) && (
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Recommendation</th>
                      )}
                      <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRatings.map((r, i) => {
                      const score = getRatingScore(r);
                      const rec   = r.recommendation_level ?? r.recommendation;
                      const skillScore = r.skill_match_score ?? r.skill_score ?? r.skills_score ?? 0;
                      const scoreColor =
                        score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        score >= 60 ? 'bg-blue-100 text-blue-700' :
                        score >= 40 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700';
                      return (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <span className="text-sm font-bold text-text-secondary">#{r.rank ?? i + 1}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar initials={getRatingName(r).slice(0, 2).toUpperCase()} size="sm" />
                              <div>
                                <p className="text-sm font-medium text-text-primary">{getRatingName(r)}</p>
                                {r.email && <p className="text-xs text-text-secondary">{r.email}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center font-bold text-sm rounded-full px-3 py-1 ${scoreColor}`}>
                              {score}%
                            </span>
                          </td>
                          {sortedRatings.some(x => (x.experience_score ?? 0) > 0) && (
                            <td className="px-4 py-3">
                              {(r.experience_score ?? 0) > 0
                                ? <span className="text-sm font-semibold text-text-primary">{r.experience_score}%</span>
                                : <span className="text-xs text-text-secondary">—</span>}
                            </td>
                          )}
                          {sortedRatings.some(x => (x.skill_match_score ?? x.skill_score ?? x.skills_score ?? 0) > 0) && (
                            <td className="px-4 py-3">
                              {skillScore > 0
                                ? <span className="text-sm font-semibold text-text-primary">{skillScore}%</span>
                                : <span className="text-xs text-text-secondary">—</span>}
                            </td>
                          )}
                          {sortedRatings.some(x => x.recommendation_level ?? x.recommendation) && (
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                rec?.toLowerCase().includes('strong') ? 'bg-emerald-100 text-emerald-700' :
                                rec?.toLowerCase().includes('not')    ? 'bg-red-100 text-red-700' :
                                rec?.toLowerCase().includes('consider') ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {rec ?? '—'}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/dashboard/candidates/${getRatingCandId(r)}?jd_id=${selectedJD.id}`)}
                              className="flex items-center gap-1.5 text-xs text-white font-medium px-3 py-1.5 rounded-lg btn-gradient transition-colors"
                            >
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Upload Tab ────────────────────────────────────────────── */}
      {activeTab === 'upload' && (<>

      {/* Drop Zone */}
      <Card>
        <CardContent className="pt-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-border hover:border-primary-300 hover:bg-primary-50/40'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${isDragActive ? 'bg-primary-100' : 'bg-gray-100'}`}>
                <Upload size={28} className={isDragActive ? 'text-primary-600' : 'text-text-secondary'} />
              </div>
              <p className="text-lg font-semibold text-text-primary mb-1">
                {isDragActive ? 'Drop resumes here...' : 'Drag & drop resumes'}
              </p>
              <p className="text-sm text-text-secondary mb-4">Upload PDF or DOCX files</p>
              <div className="flex gap-2 mb-4">
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">DOCX</Badge>
                <Badge variant="outline">Multiple Files</Badge>
              </div>
              <Button variant="secondary" size="sm">Browse Files</Button>
            </div>
          </div>

          {/* File list */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
                <p className="text-xs font-medium text-text-secondary mb-2">
                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} added
                </p>
                {uploadedFiles.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText size={16} className="text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{f.name}</p>
                      <p className="text-xs text-text-secondary">{(f.size / 1024).toFixed(1)} KB</p>
                      {f.status === 'uploading' && <ProgressBar value={f.progress} size="sm" className="mt-1" />}
                    </div>
                    {f.status === 'done'
                      ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                      : f.status === 'error'
                      ? <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                      : <Clock size={15} className="text-text-secondary flex-shrink-0 animate-pulse" />
                    }
                    <button
                      onClick={() => removeFile(f.id)}
                      className="p-0.5 hover:text-red-500 text-text-secondary transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Submit */}
      <AnimatePresence>
        {(selectedJD || uploadedFiles.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-between px-4 py-3 bg-white border border-border rounded-xl"
          >
            <div className="text-sm text-text-secondary">
              {!selectedJD && <span className="text-amber-600 font-medium">Select a job description</span>}
              {selectedJD && doneFiles.length === 0 && <span className="text-amber-600 font-medium">Add at least one resume</span>}
              {canSubmit && (
                <span className="text-emerald-600 font-medium">
                  Ready — {doneFiles.length} resume{doneFiles.length !== 1 ? 's' : ''} for <span className="font-semibold">{selectedJD!.title}</span>
                </span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={submitting}
              className="gap-2"
            >
              <Send size={14} />
              Submit Resumes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resumes Results */}
      {selectedJD && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Uploaded Resumes — {selectedJD.title}</CardTitle>
            {(isPolling || resumesLoading) && (
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Loader2 size={13} className="animate-spin" />
                {isPolling && processingData
                  ? `Processing… ${processingData.progress_percentage}%`
                  : 'Loading…'}
              </div>
            )}
          </CardHeader>

          {/* Progress strip while pipeline is running */}
          {isPolling && processingData && (
            <div className="px-6 pb-3 flex flex-wrap gap-4 text-xs text-text-secondary border-b border-border">
              {[
                { label: 'Parsed',   value: processingData.parsed },
                { label: 'Profiled', value: processingData.profiled },
                { label: 'Matched',  value: processingData.matched },
                { label: 'Ranked',   value: processingData.ranked },
              ].map(s => (
                <span key={s.label} className="flex items-center gap-1">
                  <span className="font-semibold text-text-primary">{s.value}</span> {s.label}
                </span>
              ))}
              {processingData.failed > 0 && (
                <span className="text-red-500">{processingData.failed} Failed</span>
              )}
            </div>
          )}

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Candidate</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">File</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Match Score</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {isPolling
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-6 py-4">
                            <div className="h-3.5 bg-gray-200 rounded animate-pulse w-32 mb-1.5" />
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-44" />
                          </td>
                          <td className="px-6 py-4"><div className="h-3.5 bg-gray-200 rounded animate-pulse w-40" /></td>
                          <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full animate-pulse w-20" /></td>
                          <td className="px-6 py-4"><div className="h-3.5 bg-gray-200 rounded animate-pulse w-12" /></td>
                          <td className="px-6 py-4"><div className="h-3.5 bg-gray-200 rounded animate-pulse w-20" /></td>
                        </tr>
                      ))
                    : resumes.length === 0 && !resumesLoading
                    ? (
                        <tr>
                          <td colSpan={5}>
                            <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                              <FileText size={32} className="mb-2 opacity-40" />
                              <p className="text-sm">No resumes uploaded yet for this job</p>
                            </div>
                          </td>
                        </tr>
                      )
                    : resumes.map((r, i) => (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-border last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-6 py-3">
                            <p className="text-sm font-medium text-text-primary">{r.candidate_name ?? r.name ?? '—'}</p>
                            {r.email && <p className="text-xs text-text-secondary">{r.email}</p>}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                              <FileText size={13} className="text-primary-600" />
                              <span className="truncate max-w-[160px]">{r.filename ?? '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant={r.status === 'processed' ? 'success' : r.status === 'processing' ? 'blue' : r.status === 'failed' ? 'warning' : 'outline'}>
                              {r.status ?? 'pending'}
                            </Badge>
                          </td>
                          <td className="px-6 py-3">
                            {r.match_score != null
                              ? <span className="text-sm font-semibold text-primary-600">{r.match_score}%</span>
                              : <span className="text-xs text-text-secondary">—</span>}
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-xs text-text-secondary">
                              {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      </>)}

      {/* All Jobs Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Select Job Description</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Search and select a job title</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 py-3 border-b border-border">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-border rounded-lg">
                  <Search size={14} className="text-text-secondary flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search job titles..."
                    value={modalSearch}
                    onChange={e => handleModalSearch(e.target.value)}
                    className="flex-1 text-sm bg-transparent outline-none text-text-primary placeholder-text-secondary"
                    autoFocus
                  />
                  {modalSearch && (
                    <button onClick={() => handleModalSearch('')} className="text-text-secondary hover:text-text-primary">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div
                ref={modalListRef}
                className="flex-1 overflow-y-auto py-2"
                onScroll={handleModalScroll}
              >
                {modalJobs.length === 0 && !modalFetching ? (
                  <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                    <Briefcase size={32} className="mb-2 opacity-40" />
                    <p className="text-sm">No jobs found</p>
                  </div>
                ) : (
                  modalJobs.map(jd => (
                    <button
                      key={jd.id}
                      onClick={() => handleSelectJD(jd)}
                      className={`w-full text-left px-6 py-3 flex items-center justify-between gap-3 hover:bg-primary-50 transition-colors ${
                        selectedJD?.id === jd.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <Briefcase size={14} className="text-primary-600" />
                        </div>
                        <span className="text-sm font-medium text-text-primary truncate">{jd.title}</span>
                      </div>
                      {selectedJD?.id === jd.id && <CheckCircle2 size={15} className="text-primary-600 flex-shrink-0" />}
                    </button>
                  ))
                )}
                {modalFetching && (
                  <div className="flex items-center justify-center gap-2 py-4 text-text-secondary text-xs">
                    <Loader2 size={14} className="animate-spin" /> Loading...
                  </div>
                )}
                {!modalHasMore && modalJobs.length > 0 && (
                  <p className="text-center text-xs text-text-secondary py-3">All jobs loaded</p>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-text-secondary">{modalJobs.length} job{modalJobs.length !== 1 ? 's' : ''} loaded</p>
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
