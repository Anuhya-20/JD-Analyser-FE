import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Users, Lightbulb,
  Sparkles, RefreshCw, Loader2, AlertTriangle, MessageSquare,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { BASE_URL, authHeaders } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

/* ── Shortlisted candidates types ───────────────────────── */
interface ShortlistedCandidate {
  candidate_profile_id: string;
  full_name: string | null;
  email: string;
  total_years_experience: number;
  overall_score: number;
  rank: number;
  jd_id: string;
  job_title: string;
  company_name: string;
}

interface ShortlistedResponse {
  items: ShortlistedCandidate[];
  total: number;
}

/* ── Interview API types ─────────────────────────────────── */
interface ApiQuestion {
  question?: string;
  q?: string;
  text?: string;
  difficulty?: string;
  tags?: string[];
  [key: string]: unknown;
}

type NormalizedQuestion = { q: string; difficulty: string; tags: string[] };

function normalize(item: ApiQuestion | string | unknown): NormalizedQuestion {
  if (typeof item === 'string') return { q: item, difficulty: 'Medium', tags: [] };
  if (typeof item === 'object' && item !== null) {
    const obj = item as ApiQuestion;
    return {
      q: (obj.question ?? obj.q ?? obj.text ?? '') as string,
      difficulty: (obj.difficulty ?? 'Medium') as string,
      tags: Array.isArray(obj.tags) ? obj.tags as string[] : [],
    };
  }
  return { q: String(item), difficulty: 'Medium', tags: [] };
}

function labelFromKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  technical:  <Code size={15} />,
  behavioral: <Users size={15} />,
  scenario:   <Sparkles size={15} />,
  situational:<Sparkles size={15} />,
};
const SECTION_COLORS: Record<string, string> = {
  technical:  'text-primary-600',
  behavioral: 'text-emerald-600',
  scenario:   'text-violet-600',
  situational:'text-violet-600',
};

function iconFor(key: string) {
  return SECTION_ICONS[key.toLowerCase()] ?? <MessageSquare size={15} />;
}
function colorFor(key: string) {
  return SECTION_COLORS[key.toLowerCase()] ?? 'text-primary-600';
}

/* ── Extract all renderable sections from ANY API response── */
function parseSections(raw: unknown): { key: string; title: string; questions: NormalizedQuestion[] }[] {
  if (!raw || typeof raw !== 'object') return [];

  const sections: { key: string; title: string; questions: NormalizedQuestion[] }[] = [];

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(value) || value.length === 0) continue;
    const questions = (value as unknown[]).map(normalize).filter(q => q.q.trim() !== '');
    if (questions.length > 0) {
      sections.push({ key, title: labelFromKey(key), questions });
    }
  }

  return sections;
}

const difficultyColors: Record<string, string> = {
  Easy:   'text-emerald-600 bg-emerald-50',
  Medium: 'text-amber-600 bg-amber-50',
  Hard:   'text-red-600 bg-red-50',
};

function getInitials(name: string | null, email: string) {
  if (name) return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  return email.slice(0, 2).toUpperCase();
}

/* ── QuestionCard ───────────────────────────────────────── */
function QuestionCard({ q, difficulty, tags, index }: { q: string; difficulty: string; tags: string[]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-border rounded-xl p-4 hover:shadow-card-hover transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-text-primary font-medium leading-relaxed flex-1">{q}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${difficultyColors[difficulty] ?? 'text-amber-600 bg-amber-50'}`}>
          {difficulty}
        </span>
      </div>
      {tags.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
        </div>
      )}
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export function InterviewQuestions() {
  const [candidates, setCandidates]               = useState<ShortlistedCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [fetchError, setFetchError]               = useState<string | null>(null);
  const [selectedId, setSelectedId]               = useState<string | null>(null);
  const [generating, setGenerating]               = useState(false);
  const [generated, setGenerated]                 = useState(false);
  const [generateError, setGenerateError]         = useState<string | null>(null);
  const [sections, setSections]                   = useState<{ key: string; title: string; questions: NormalizedQuestion[] }[]>([]);

  /* Fetch shortlisted candidates */
  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/candidates/accepted?page=1&page_size=50`, {
      headers: authHeaders(),
    })
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<ShortlistedResponse>; })
      .then(data => {
        setCandidates(data.items ?? []);
        if ((data.items ?? []).length > 0) setSelectedId(data.items[0].candidate_profile_id);
      })
      .catch((err: Error) => setFetchError(err.message))
      .finally(() => setLoadingCandidates(false));
  }, []);

  const selected = candidates.find(c => c.candidate_profile_id === selectedId) ?? null;

  const handleGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    setGenerated(false);
    setGenerateError(null);
    setSections([]);
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/interview/${selected.jd_id}/${selected.candidate_profile_id}`,
        { method: 'POST', headers: authHeaders() }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: unknown = await res.json();
      const parsed = parseSections(data);
      setSections(parsed);
      setGenerated(true);
      toast.success('Interview questions generated successfully!');
    } catch (err) {
      setGenerateError((err as Error).message);
      toast.error('Failed to generate interview questions.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Interview Question Generator</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Tailored interview questions generated based on shortlisted candidate profiles.
        </p>
      </div>

      {/* Candidates fetch error */}
      {fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle size={15} /> Failed to load candidates: {fetchError}
        </div>
      )}

      {/* Candidate selector */}
      <Card>
        <CardHeader><CardTitle>Select Shortlisted Candidate</CardTitle></CardHeader>
        <CardContent>
          {loadingCandidates ? (
            <div className="flex items-center gap-2 py-4 text-text-secondary text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading shortlisted candidates...
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">
              No shortlisted candidates found. Shortlist candidates from the rankings page first.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {candidates.slice(0, 8).map(c => {
                  const name     = c.full_name || c.email;
                  const initials = getInitials(c.full_name, c.email);
                  const active   = selectedId === c.candidate_profile_id;
                  return (
                    <button
                      key={c.candidate_profile_id}
                      onClick={() => {
                        setSelectedId(c.candidate_profile_id);
                        setGenerated(false);
                        setSections([]);
                        setGenerateError(null);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        active
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'border-border text-text-secondary hover:bg-gray-50'
                      }`}
                    >
                      <Avatar initials={initials} size="sm" />
                      <span className="truncate max-w-[120px]">{name}</span>
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div className="mt-4 flex items-center gap-4">
                  <Avatar initials={getInitials(selected.full_name, selected.email)} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {selected.full_name || selected.email}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {selected.overall_score.toFixed(1)}% match
                      &nbsp;&middot;&nbsp;
                      {selected.total_years_experience} yrs exp
                      &nbsp;&middot;&nbsp;
                      <span className="capitalize">{selected.job_title}</span>
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerate}
                    loading={generating}
                    variant="secondary"
                    size="sm"
                    className="ml-auto gap-1.5 flex-shrink-0"
                  >
                    <RefreshCw size={13} />
                    {generating ? 'Generating...' : generated ? 'Regenerate' : 'Generate Questions'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Generate error */}
      {generateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle size={15} /> Failed to generate questions: {generateError}
        </div>
      )}

      {/* Questions — rendered dynamically from API response keys */}
      <AnimatePresence>
        {generated && selected && sections.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Context banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">
                  Generated for {selected.full_name || selected.email}
                </p>
                <p className="text-xs text-amber-700">
                  Role: <span className="font-medium capitalize">{selected.job_title}</span>
                  &nbsp;&middot;&nbsp;
                  Experience: <span className="font-medium">{selected.total_years_experience} yrs</span>
                  &nbsp;&middot;&nbsp;
                  Match score: <span className="font-medium">{selected.overall_score.toFixed(1)}%</span>
                  &nbsp;&middot;&nbsp;
                  Total questions: <span className="font-medium">{sections.reduce((n, s) => n + s.questions.length, 0)}</span>
                </p>
              </div>
            </div>

            {/* One card per section returned by the API */}
            {sections.map(section => (
              <Card key={section.key}>
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <span className={colorFor(section.key)}>{iconFor(section.key)}</span>
                  <CardTitle>{section.title} ({section.questions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.questions.map((q, i) => (
                    <QuestionCard key={i} {...q} index={i} />
                  ))}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* API responded but no question arrays found */}
        {generated && sections.length === 0 && !generateError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-center"
          >
            <Lightbulb className="mx-auto text-amber-400 mb-2" size={24} />
            <p className="text-sm font-medium text-amber-800">No questions returned by the API.</p>
            <p className="text-xs text-amber-600 mt-1">The server responded successfully but contained no question data.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
