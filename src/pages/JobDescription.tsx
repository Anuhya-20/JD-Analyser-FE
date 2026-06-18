import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Brain, CheckCircle2, X,
  Briefcase, GraduationCap, Award, Clock, ChevronRight, Eye, Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BASE_URL, authHeaders } from '@/lib/api';

interface Job {
  id: string;
  title: string;
  company_name?: string;
  status?: string;
  is_active?: boolean;
  candidates_count?: number;
}

const requiredSkills = ['React', 'Python', 'AWS', 'PostgreSQL', 'Docker', 'TypeScript', 'Node.js'];
const preferredSkills = ['Kubernetes', 'GraphQL', 'Redis', 'Terraform', 'CI/CD'];

export function JobDescription() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<Record<string, boolean>>({});
  const [togglingJobs, setTogglingJobs] = useState<Record<string, boolean>>({});

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/jobs?active_only=false&page=1&page_size=50`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const list: Job[] = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
      setJobs(list);
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
      if (companyName.trim()) formData.append('company_name', companyName.trim());

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

      setAnalyzed(true);
      fetchJobs();
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
          {/* Job Title + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
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
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Bilvantis"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-border p-1 bg-gray-50">
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
                isDragActive ? 'border-primary-500 bg-primary-50' : file ? 'border-emerald-400 bg-emerald-50' : 'border-border hover:border-primary-300 hover:bg-primary-50/40'
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
              placeholder="Paste your job description text here..."
              rows={10}
              className="w-full p-4 border border-border rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          )}

          {error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleAnalyze}
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
        {analyzed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <CheckCircle2 size={18} />
              <span>Analysis complete! Extracted the following requirements.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required Skills */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Brain size={14} className="text-primary-600" />
                  </div>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills.map(s => (
                      <Badge key={s} variant="default" className="text-xs px-3 py-1">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preferred Skills */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Award size={14} className="text-amber-600" />
                  </div>
                  <CardTitle>Preferred Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {preferredSkills.map(s => (
                      <Badge key={s} variant="warning" className="text-xs px-3 py-1">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <Clock size={14} className="text-emerald-600" />
                  </div>
                  <CardTitle>Experience Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-text-primary">5+ Years</p>
                  <p className="text-sm text-text-secondary mt-1">Full Stack Development</p>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                    <GraduationCap size={14} className="text-violet-600" />
                  </div>
                  <CardTitle>Education Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-text-primary">Bachelor's Degree</p>
                  <p className="text-sm text-text-secondary mt-1">Computer Science or related field</p>
                </CardContent>
              </Card>
            </div>

            {/* Certifications */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Award size={14} className="text-emerald-600" />
                </div>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['AWS Certified Developer', 'AWS Solutions Architect', 'Kubernetes Administrator (CKA)'].map(c => (
                    <Badge key={c} variant="success" className="text-xs px-3 py-1">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => navigate('/dashboard/candidates')} className="gap-2">
                Upload Resumes <ChevronRight size={15} />
              </Button>
            </div>
          </motion.div>
        )}
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
            jobs.map((job) => (
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
                        activeJobs[job.id] ? 'bg-primary-600' : 'bg-gray-300'
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
                  className="text-xs text-white font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <FileText size={12} />
                  View JD
                </button>
                <button
                  onClick={() => navigate(`/dashboard/candidates?jd_id=${job.id}&tab=rankings`)}
                  className="text-xs text-white font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <Eye size={12} />
                  View Results
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
