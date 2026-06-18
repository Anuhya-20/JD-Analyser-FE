import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Trash2, Eye, Brain,
  CheckCircle2, AlertCircle, Clock, X,
  ChevronDown, Briefcase, Search, Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { mockCandidates, mockJobs, JobDescription } from '@/data/mockData';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
}

export function CandidateUpload() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedJD, setSelectedJD] = useState<JobDescription | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeJDs = mockJobs.filter(j => j.status === 'Active');
  const previewJDs = activeJDs.slice(0, 5);
  const filteredModalJDs = activeJDs.filter(j =>
    j.title.toLowerCase().includes(modalSearch.toLowerCase()) ||
    j.company.toLowerCase().includes(modalSearch.toLowerCase()) ||
    j.department.toLowerCase().includes(modalSearch.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: UploadedFile[] = accepted.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      progress: 0,
      status: 'uploading',
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(f => {
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 25;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
          setUploadedFiles(prev => prev.map(uf => uf.id === f.id ? { ...uf, progress: 100, status: 'done' } : uf));
        } else {
          setUploadedFiles(prev => prev.map(uf => uf.id === f.id ? { ...uf, progress: Math.round(prog) } : uf));
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

  function handleSelectJD(jd: JobDescription) {
    setSelectedJD(jd);
    setDropdownOpen(false);
    setModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Candidate Upload</h1>
          <p className="text-text-secondary text-sm mt-0.5">Upload resumes in bulk for AI-powered analysis.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* JD Selector Dropdown */}
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
                      Active Job Descriptions
                    </p>
                  </div>

                  <div className="py-1">
                    {previewJDs.map(jd => (
                      <button
                        key={jd.id}
                        onClick={() => handleSelectJD(jd)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-primary-50 transition-colors ${
                          selectedJD?.id === jd.id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{jd.title}</p>
                            <p className="text-xs text-text-secondary truncate">{jd.company} · {jd.department}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                            <Users size={11} className="text-text-secondary" />
                            <span className="text-xs text-text-secondary">{jd.candidates}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {activeJDs.length > 5 && (
                    <div className="border-t border-border">
                      <button
                        onClick={() => { setDropdownOpen(false); setModalOpen(true); }}
                        className="w-full px-3 py-2.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors text-center"
                      >
                        View More ({activeJDs.length - 5} more active JDs)
                      </button>
                    </div>
                  )}
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
                <p className="text-xs text-primary-600">{selectedJD.company} · {selectedJD.department} · {selectedJD.experienceRequired}+ yrs exp</p>
              </div>
              <Badge variant="success">Active</Badge>
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

      {/* Drop Zone */}
      <Card>
        <CardContent className="pt-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-primary-500 bg-primary-50' : 'border-border hover:border-primary-300 hover:bg-primary-50/40'
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
              <p className="text-sm text-text-secondary mb-4">Upload PDF or DOCX files in bulk</p>
              <div className="flex gap-2 mb-4">
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">DOCX</Badge>
                <Badge variant="outline">Multiple Files</Badge>
              </div>
              <Button variant="secondary" size="sm">Browse Files</Button>
            </div>
          </div>

          {/* Upload Progress */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
                <p className="text-xs font-medium text-text-secondary mb-2">Uploading {uploadedFiles.length} file(s)</p>
                {uploadedFiles.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText size={16} className="text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{f.name}</p>
                      {f.status === 'uploading' && (
                        <ProgressBar value={f.progress} size="sm" className="mt-1" />
                      )}
                    </div>
                    {f.status === 'done'
                      ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                      : f.status === 'error'
                      ? <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                      : <Clock size={15} className="text-text-secondary flex-shrink-0 animate-pulse" />
                    }
                    <button onClick={() => removeFile(f.id)} className="p-0.5 hover:text-red-500 text-text-secondary">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Candidate Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Uploaded Resumes ({mockCandidates.length})</CardTitle>
          <div className="flex gap-2">
            <Badge variant="success">{mockCandidates.filter(c => c.status !== 'Applied').length} Processed</Badge>
            <Badge variant="warning">{mockCandidates.filter(c => c.status === 'Applied').length} Pending</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Candidate</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Experience</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Skills</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Education</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCandidates.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={c.photo} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{c.name}</p>
                          <p className="text-xs text-text-secondary">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text-primary">{c.experience} yrs</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {c.skills.slice(0, 3).map(s => <Badge key={s} variant="default" className="text-xs">{s}</Badge>)}
                        {c.skills.length > 3 && <Badge variant="outline" className="text-xs">+{c.skills.length - 3}</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-text-secondary">{c.education.split("'")[0] + "'s"}</span>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={c.status === 'Shortlisted' ? 'success' : c.status === 'Interview' ? 'blue' : c.status === 'Applied' ? 'outline' : 'default'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/candidates/${c.id}`)} className="p-1.5 hover:bg-primary-50 rounded text-text-secondary hover:text-primary-600 transition-colors" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => navigate('/dashboard/ai-processing')} className="p-1.5 hover:bg-emerald-50 rounded text-text-secondary hover:text-emerald-600 transition-colors" title="Analyze">
                          <Brain size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded text-text-secondary hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* All Active JDs Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">All Active Job Descriptions</h2>
                  <p className="text-xs text-text-secondary mt-0.5">{activeJDs.length} active positions available</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search */}
              <div className="px-6 py-3 border-b border-border">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-border rounded-lg">
                  <Search size={14} className="text-text-secondary flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by title, company or department..."
                    value={modalSearch}
                    onChange={e => setModalSearch(e.target.value)}
                    className="flex-1 text-sm bg-transparent outline-none text-text-primary placeholder-text-secondary"
                    autoFocus
                  />
                  {modalSearch && (
                    <button onClick={() => setModalSearch('')} className="text-text-secondary hover:text-text-primary">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* JD List */}
              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
                {filteredModalJDs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                    <Briefcase size={32} className="mb-2 opacity-40" />
                    <p className="text-sm">No active JDs match your search</p>
                  </div>
                ) : (
                  filteredModalJDs.map(jd => (
                    <button
                      key={jd.id}
                      onClick={() => handleSelectJD(jd)}
                      className={`w-full text-left p-4 rounded-xl border transition-all hover:border-primary-300 hover:bg-primary-50/50 ${
                        selectedJD?.id === jd.id
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-border bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Briefcase size={14} className="text-primary-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">{jd.title}</p>
                            <p className="text-xs text-text-secondary mt-0.5">{jd.company} · {jd.department}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {jd.requiredSkills.slice(0, 4).map(s => (
                                <span key={s} className="text-xs px-1.5 py-0.5 bg-gray-100 text-text-secondary rounded">
                                  {s}
                                </span>
                              ))}
                              {jd.requiredSkills.length > 4 && (
                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-text-secondary rounded">
                                  +{jd.requiredSkills.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Badge variant="success">Active</Badge>
                          <div className="flex items-center gap-1 text-text-secondary">
                            <Users size={11} />
                            <span className="text-xs">{jd.candidates} candidates</span>
                          </div>
                          <span className="text-xs text-text-secondary">{jd.experienceRequired}+ yrs</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-text-secondary">
                  {filteredModalJDs.length} of {activeJDs.length} active JDs
                </p>
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
