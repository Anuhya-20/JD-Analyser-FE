import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Eye, GitCompare, ChevronDown, Briefcase,
  Search, X, Loader2, Trophy, Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { BASE_URL, authHeaders } from '@/lib/api';

interface Job { id: string; title: string; }

interface Rating {
  id: string;
  candidate_id?: string;
  candidate_profile_id?: string;
  candidate_name?: string;
  full_name?: string;
  name?: string;
  email?: string;
  rank?: number;
  match_score?: number;
  overall_score?: number;
  skill_score?: number;
  skills_score?: number;
  skill_match_score?: number;
  experience_score?: number;
  experience?: number;
  years_experience?: number;
  total_years_experience?: number;
  recommendation?: string;
  recommendation_level?: string;
  candidate_status?: string;
}

const JD_PAGE_SIZE = 20;

async function fetchTitles(page: number, search: string): Promise<Job[]> {
  try {
    const params = new URLSearchParams({ page: String(page), page_size: String(JD_PAGE_SIZE) });
    if (search) params.set('search', search);
    const res = await fetch(`${BASE_URL}/api/v1/jobs/titles?${params}`, { headers: authHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items ?? data.data ?? []);
  } catch { return []; }
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? 'bg-emerald-100 text-emerald-700' :
    score >= 80 ? 'bg-blue-100 text-blue-700' :
    score >= 70 ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center justify-center font-bold text-sm rounded-full px-3 py-1 ${color}`}>
      {score}%
    </span>
  );
}

export function MatchResults() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  // ── JD Dropdown ─────────────────────────────────────────────────────────────
  const [selectedJD, setSelectedJD] = useState<Job | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [ddJobs, setDdJobs]       = useState<Job[]>([]);
  const [ddLoading, setDdLoading] = useState(false);
  const ddInitialized             = useRef(false);

  // Modal state
  const [modalOpen, setModalOpen]         = useState(false);
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

  useEffect(() => {
    if (!dropdownOpen || ddInitialized.current) return;
    ddInitialized.current = true;
    setDdLoading(true);
    fetchTitles(1, '').then(list => { setDdJobs(list); setDdLoading(false); });
  }, [dropdownOpen]);

  const doModalFetch = useCallback(async (pg: number, search: string, reset: boolean) => {
    if (modalFetchingRef.current) return;
    modalFetchingRef.current = true;
    setModalFetching(true);
    const list = await fetchTitles(pg, search);
    const more = list.length === JD_PAGE_SIZE;
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

  function handleSelectJD(jd: Job) {
    setSelectedJD(jd);
    setDropdownOpen(false);
    setModalOpen(false);
    setSelected([]);
  }

  // ── Ratings ─────────────────────────────────────────────────────────────────
  const [ratings, setRatings]           = useState<Rating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedJD) { setRatings([]); return; }
    setRatingsLoading(true);
    setRatingsError(null);
    fetch(`${BASE_URL}/api/v1/ratings/${selectedJD.id}`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then(data => setRatings(Array.isArray(data) ? data : (data.items ?? data.data ?? [])))
      .catch(err => setRatingsError(err.message))
      .finally(() => setRatingsLoading(false));
  }, [selectedJD]);

  const sorted = [...ratings].sort((a, b) => {
    const sa = a.match_score ?? a.overall_score ?? 0;
    const sb = b.match_score ?? b.overall_score ?? 0;
    return sb - sa;
  });

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);

  const getScore  = (r: Rating) => r.match_score ?? r.overall_score ?? 0;
  const getSkill  = (r: Rating) => r.skill_score ?? r.skills_score ?? r.skill_match_score ?? 0;
  const getExp    = (r: Rating) => r.experience_score ?? 0;
  const getName   = (r: Rating) => r.full_name ?? r.candidate_name ?? r.name ?? '—';
  const getYears  = (r: Rating) => r.experience ?? r.years_experience ?? r.total_years_experience;
  const getRec    = (r: Rating) => r.recommendation ?? r.recommendation_level;
  const getCandId = (r: Rating) => r.candidate_id ?? r.candidate_profile_id ?? r.id;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Candidate Ranking Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {selectedJD ? `AI-ranked candidates for ${selectedJD.title}` : 'Select a job description to view rankings'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* JD Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(p => !p)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[220px] justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Briefcase size={14} className="text-primary-600 flex-shrink-0" />
                <span className="truncate text-text-primary">
                  {selectedJD ? selectedJD.title : 'Select Job Description'}
                </span>
              </div>
              <ChevronDown size={14} className={`text-text-secondary flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
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
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Job Descriptions</p>
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
                          className={`w-full text-left px-3 py-2.5 hover:bg-primary-50 transition-colors flex items-center justify-between gap-2 ${selectedJD?.id === jd.id ? 'bg-primary-50' : ''}`}
                        >
                          <span className="text-sm font-medium text-text-primary truncate">{jd.title}</span>
                          {selectedJD?.id === jd.id && <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />}
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

          {selected.length >= 2 && (
            <Button onClick={() => navigate('/dashboard/comparison')} variant="secondary" className="gap-2">
              <GitCompare size={15} />
              Compare ({selected.length})
            </Button>
          )}
        </div>
      </div>

      {/* Empty / loading / error states */}
      {!selectedJD && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <Briefcase size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Select a job description to see candidate rankings</p>
          </CardContent>
        </Card>
      )}

      {selectedJD && ratingsLoading && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-16 text-text-secondary text-sm">
            <Loader2 size={18} className="animate-spin" /> Loading rankings...
          </CardContent>
        </Card>
      )}

      {selectedJD && ratingsError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <p className="text-sm text-red-500">{ratingsError}</p>
          </CardContent>
        </Card>
      )}

      {selectedJD && !ratingsLoading && !ratingsError && ratings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <Users size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No ratings found for this job description</p>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {!ratingsLoading && sorted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sorted.slice(0, 3).map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
            >
              <Card hover className="border relative overflow-hidden">
                <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
                  #{r.rank ?? i + 1}
                </div>
                <CardContent className="pt-5 pb-4">
                  <div className="flex flex-col items-center text-center mb-3">
                    <Avatar initials={getName(r).slice(0, 2).toUpperCase()} size="lg" className="mb-2" />
                    <p className="font-semibold text-text-primary text-sm">{getName(r)}</p>
                    {r.email && <p className="text-xs text-text-secondary truncate max-w-full">{r.email}</p>}
                  </div>
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl font-bold text-primary-600">{getScore(r)}%</span>
                  </div>
                  {(getSkill(r) > 0 || getExp(r) > 0) && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5 text-center">
                      {getSkill(r) > 0 && (
                        <div className="bg-gray-50 rounded-lg p-1.5">
                          <p className="text-xs font-bold text-text-primary">{getSkill(r)}%</p>
                          <p className="text-xs text-text-secondary">Skills</p>
                        </div>
                      )}
                      {getExp(r) > 0 && (
                        <div className="bg-gray-50 rounded-lg p-1.5">
                          <p className="text-xs font-bold text-text-primary">{getExp(r)}%</p>
                          <p className="text-xs text-text-secondary">Exp</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Full Rankings Table */}
      {!ratingsLoading && sorted.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              <CardTitle>Full Candidate Rankings</CardTitle>
            </div>
            <p className="text-xs text-text-secondary">Select up to 3 to compare</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Rank</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Candidate</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Match Score</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Recommendation</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`border-b border-border last:border-0 hover:bg-gray-50 ${selected.includes(r.id) ? 'bg-primary-50/40' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-text-secondary">#{r.rank ?? i + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={getName(r).slice(0, 2).toUpperCase()} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-text-primary">{getName(r)}</p>
                            {getYears(r) != null
                              ? <p className="text-xs text-text-secondary">{getYears(r)} yrs exp</p>
                              : r.email && <p className="text-xs text-text-secondary">{r.email}</p>
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={getScore(r)} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          getRec(r)?.toLowerCase().includes('strong')   ? 'bg-emerald-100 text-emerald-700' :
                          getRec(r)?.toLowerCase().includes('not')      ? 'bg-red-100 text-red-700' :
                          getRec(r)?.toLowerCase().includes('consider') ? 'bg-blue-100 text-blue-700' :
                          getRec(r)?.toLowerCase() === 'maybe'          ? 'bg-amber-100 text-amber-700' :
                          getRec(r) ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {getRec(r) ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const cs = r.candidate_status?.toLowerCase();
                          if (cs === 'accepted') return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Shortlisted</span>
                          );
                          if (cs === 'rejected') return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejected</span>
                          );
                          return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/dashboard/candidates/${getCandId(r)}?jd_id=${selectedJD?.id}`)}
                          className="flex items-center gap-1.5 text-xs text-white font-medium px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JD Search Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                <h2 className="text-lg font-semibold text-text-primary">Select Job Description</h2>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors">
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
                  {modalSearch && <button onClick={() => handleModalSearch('')} className="text-text-secondary hover:text-text-primary"><X size={13} /></button>}
                </div>
              </div>
              <div ref={modalListRef} className="flex-1 overflow-y-auto py-2" onScroll={handleModalScroll}>
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
                      className={`w-full text-left px-6 py-3 flex items-center justify-between gap-3 hover:bg-primary-50 transition-colors ${selectedJD?.id === jd.id ? 'bg-primary-50' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <Briefcase size={14} className="text-primary-600" />
                        </div>
                        <span className="text-sm font-medium text-text-primary truncate">{jd.title}</span>
                      </div>
                      {selectedJD?.id === jd.id && <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />}
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
              <div className="px-6 py-4 border-t border-border flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
