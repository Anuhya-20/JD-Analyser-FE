import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Brain, CheckCircle2, X,
  Briefcase, Eye, Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BASE_URL, authHeaders } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface Job {
  id: string;
  title: string;
  company_name?: string;
  status?: string;
  is_active?: boolean;
  candidates_count?: number;
}

export function JobDescription() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [jobTitle, setJobTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentTouched, setContentTouched] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<Record<string, boolean>>({});
  const [togglingJobs, setTogglingJobs] = useState<Record<string, boolean>>({});
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsTotal, setJobsTotal] = useState(0);
  const JOBS_PAGE_SIZE = 10;

  const fetchJobs = useCallback(async (page = 1) => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/jobs?active_only=false&page=${page}&page_size=${JOBS_PAGE_SIZE}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const list: Job[] = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
      setJobs(list);
      setJobsPage(page);
      setJobsTotal(data.total ?? list.length);
      setActiveJobs(Object.fromEntries(list.map(j => [j.id, j.is_active ?? j.status === 'Active'])));
    } catch (err) {
      setJobsError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const toggleActive = async (jobId: string, currentlyActive: boolean) => {
    setTogglingJobs(prev => ({ ...prev, [jobId]: true }));
    const endpoint = currentlyActive ? 'deactivate' : 'activate';
    try {
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${jobId}/${endpoint}`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setActiveJobs(prev => ({ ...prev, [jobId]: !currentlyActive }));
    } catch {
      // revert on failure — no change needed since we didn't optimistically update
    } finally {
      setTogglingJobs(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', jobTitle.trim());
      formData.append('company_name', 'bilvantis');

      if (mode === 'upload' && file) {
        formData.append('file', file);
      } else if (mode === 'paste' && pastedText.trim()) {
        formData.append('description_text', pastedText.trim());
      }

      const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error ${res.status}`);
      }

      fetchJobs(1);
      setJobTitle('');
      setFile(null);
      setPastedText('');
      setContentTouched(false);
      setMode('upload');
      toast.success('Job description uploaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Job Description Analysis</h1>
        <p className="text-text-secondary text-sm mt-0.5">Upload or paste your JD and let AI extract all requirements.</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          {/* Job Title */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wide mb-1.5">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Developer"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wide mb-1.5">
              Job Description <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-lg border border-border p-1 bg-gray-50 w-fit">
              <button
                onClick={() => setMode('upload')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'upload' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary'}`}
              >
                Upload File
              </button>
              <button
                onClick={() => setMode('paste')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'paste' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary'}`}
              >
                Paste Text
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mode === 'upload' ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-primary-500 bg-primary-50'
                : file ? 'border-emerald-400 bg-emerald-50'
                : contentTouched && !file ? 'border-red-400 bg-red-50/30'
                : 'border-border hover:border-primary-300 hover:bg-primary-50/40'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 size={28} className="text-emerald-600" />
                  </div>
                  <p className="font-semibold text-text-primary mb-1">{file.name}</p>
                  <p className="text-xs text-text-secondary mb-3">{(file.size / 1024).toFixed(1)} KB</p>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <X size={12} /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-3">
                    <Upload size={24} className="text-primary-600" />
                  </div>
                  <p className="font-semibold text-text-primary mb-1">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop your JD file'}
                  </p>
                  <p className="text-sm text-text-secondary mb-3">or click to browse</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">PDF</Badge>
                    <Badge variant="outline">DOCX</Badge>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              onBlur={() => setContentTouched(true)}
              placeholder="Paste your job description text here..."
              rows={10}
              className={`w-full p-4 border rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                contentTouched && !pastedText.trim() ? 'border-red-400' : 'border-border'
              }`}
            />
          )}

          {contentTouched && !file && !pastedText.trim() && (
            <p className="mt-1.5 text-xs text-red-500">Please upload a file or paste a job description.</p>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => { setContentTouched(true); handleAnalyze(); }}
              loading={analyzing}
              disabled={!jobTitle.trim() || (!file && !pastedText.trim())}
              size="lg"
              className="gap-2"
            >
              <Brain size={16} />
             Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
      </AnimatePresence>

      {/* Existing JDs */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Job Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobsLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-text-secondary text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading jobs...
            </div>
          ) : jobsError ? (
            <p className="text-center py-10 text-sm text-red-500">{jobsError}</p>
          ) : jobs.length === 0 ? (
            <p className="text-center py-10 text-sm text-text-secondary">No job descriptions found.</p>
          ) : (
            <>
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">{job.title}</p>
                    <p className="text-xs text-text-secondary">
                      {job.company_name ?? '—'}
                      {job.candidates_count != null ? ` · ${job.candidates_count} candidates` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {togglingJobs[job.id] ? (
                      <Loader2 size={16} className="animate-spin text-text-secondary" />
                    ) : (
                      <button
                        onClick={() => toggleActive(job.id, activeJobs[job.id])}
                        className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                          activeJobs[job.id] ? 'btn-gradient' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            activeJobs[job.id] ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    )}
                    <span className={`text-xs font-medium w-12 ${activeJobs[job.id] ? 'text-primary-600' : 'text-gray-400'}`}>
                      {activeJobs[job.id] ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                    className="text-xs text-white font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-gradient transition-colors"
                  >
                    <FileText size={12} />
                    View JD
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/candidates?jd_id=${job.id}&tab=rankings`)}
                    className="text-xs text-white font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-gradient transition-colors"
                  >
                    <Eye size={12} />
                    View Results
                  </button>
                </div>
              ))}

              {/* Pagination */}
              {jobsTotal > JOBS_PAGE_SIZE && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                  <p className="text-xs text-text-secondary">
                    Showing {((jobsPage - 1) * JOBS_PAGE_SIZE) + 1}–{Math.min(jobsPage * JOBS_PAGE_SIZE, jobsTotal)} of {jobsTotal} jobs
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => fetchJobs(jobsPage - 1)}
                      disabled={jobsPage === 1 || jobsLoading}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(jobsTotal / JOBS_PAGE_SIZE) }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === Math.ceil(jobsTotal / JOBS_PAGE_SIZE) || Math.abs(p - jobsPage) <= 1)
                      .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === '...' ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-xs text-text-secondary">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => fetchJobs(p as number)}
                            disabled={jobsLoading}
                            className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                              jobsPage === p
                                ? 'bg-primary-600 text-white'
                                : 'border border-border text-text-secondary hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => fetchJobs(jobsPage + 1)}
                      disabled={jobsPage >= Math.ceil(jobsTotal / JOBS_PAGE_SIZE) || jobsLoading}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
