import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Brain, Code, Users, Lightbulb, ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { mockCandidates } from '@/data/mockData';

const sorted = [...mockCandidates].sort((a, b) => b.matchScore - a.matchScore);

const questionBank = {
  technical: [
    { q: "Explain how you would architect a React application for performance at scale with millions of users.", difficulty: "Hard", tags: ["React", "Architecture"] },
    { q: "How would you implement authentication with JWT tokens and refresh token rotation in a full-stack app?", difficulty: "Medium", tags: ["Security", "Backend"] },
    { q: "Describe your approach to database query optimization in PostgreSQL for a high-traffic system.", difficulty: "Hard", tags: ["PostgreSQL", "Performance"] },
    { q: "Walk me through setting up a CI/CD pipeline using Docker and AWS ECS.", difficulty: "Medium", tags: ["AWS", "Docker", "DevOps"] },
    { q: "How do you handle state management in a large React TypeScript application?", difficulty: "Medium", tags: ["React", "TypeScript"] },
  ],
  behavioral: [
    { q: "Tell me about a time you led a technical team through a critical production incident. What did you do?", difficulty: "Medium", tags: ["Leadership", "Problem-solving"] },
    { q: "Describe a situation where you had to disagree with a technical decision made by senior leadership.", difficulty: "Medium", tags: ["Communication", "Confidence"] },
    { q: "How do you handle competing priorities when multiple stakeholders have urgent requests?", difficulty: "Easy", tags: ["Prioritization", "Communication"] },
    { q: "Tell me about the most complex technical project you've delivered. What challenges did you face?", difficulty: "Medium", tags: ["Technical Depth", "Project Management"] },
  ],
  scenario: [
    { q: "Our application is experiencing 500ms latency spikes every 30 minutes in production. How would you debug this?", difficulty: "Hard", tags: ["Debugging", "Performance", "AWS"] },
    { q: "You discover a security vulnerability in the production database the day before a major product launch. What do you do?", difficulty: "Hard", tags: ["Security", "Decision Making"] },
    { q: "The team wants to migrate from a monolith to microservices. You need to propose an incremental migration plan.", difficulty: "Hard", tags: ["Architecture", "Strategy"] },
  ],
};

const difficultyColors: Record<string, string> = {
  Easy: 'text-emerald-600 bg-emerald-50',
  Medium: 'text-amber-600 bg-amber-50',
  Hard: 'text-red-600 bg-red-50',
};

function QuestionCard({ q, difficulty, tags, index }: { q: string; difficulty: string; tags: string[]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-border rounded-xl p-4 hover:shadow-card-hover transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-text-primary font-medium leading-relaxed">{q}</p>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 p-3 bg-primary-50 rounded-lg"
            >
              <p className="text-xs text-primary-700 font-medium mb-1">What to look for:</p>
              <p className="text-xs text-primary-600">Look for structured thinking, real-world examples, measurable outcomes, and how the candidate handled edge cases or challenges.</p>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[difficulty]}`}>{difficulty}</span>
          <button onClick={() => setExpanded(v => !v)} className="p-1 text-text-secondary hover:text-text-primary">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      <div className="flex gap-1.5 mt-2">
        {tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
      </div>
    </motion.div>
  );
}

export function InterviewQuestions() {
  const [selectedCandidate, setSelectedCandidate] = useState(sorted[0].id);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(true);

  const candidate = mockCandidates.find(c => c.id === selectedCandidate) || sorted[0];

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Interview Question Generator</h1>
        <p className="text-text-secondary text-sm mt-0.5">Tailored interview questions generated based on candidate profile and JD requirements.</p>
      </div>

      {/* Candidate selector */}
      <Card>
        <CardHeader><CardTitle>Select Candidate</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sorted.slice(0, 5).map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedCandidate(c.id); setGenerated(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  selectedCandidate === c.id ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-border text-text-secondary hover:bg-gray-50'
                }`}
              >
                <Avatar initials={c.photo} size="sm" />
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar initials={candidate.photo} size="md" />
              <div>
                <p className="text-sm font-semibold text-text-primary">{candidate.name}</p>
                <p className="text-xs text-text-secondary">{candidate.matchScore}% match &middot; {candidate.experience} yrs</p>
              </div>
            </div>
            <Button onClick={handleGenerate} loading={generating} variant="secondary" size="sm" className="ml-auto gap-1.5">
              <RefreshCw size={13} />
              {generating ? 'Generating...' : 'Generate Questions'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {generated && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Missing Skills note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">Generated based on candidate profile</p>
                <p className="text-xs text-amber-700">
                  Questions focus on <span className="font-medium">{candidate.skills.slice(0, 3).join(', ')}</span> (core skills)
                  and <span className="font-medium">{candidate.weaknesses[0]}</span> (identified gap).
                </p>
              </div>
            </div>

            {/* Technical Questions */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <Code size={15} className="text-primary-600" />
                <CardTitle>Technical Questions ({questionBank.technical.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questionBank.technical.map((q, i) => (
                  <QuestionCard key={i} {...q} index={i} />
                ))}
              </CardContent>
            </Card>

            {/* Behavioral Questions */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <Users size={15} className="text-emerald-600" />
                <CardTitle>Behavioral Questions ({questionBank.behavioral.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questionBank.behavioral.map((q, i) => (
                  <QuestionCard key={i} {...q} index={i} />
                ))}
              </CardContent>
            </Card>

            {/* Scenario-Based */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 py-3">
                <Sparkles size={15} className="text-violet-600" />
                <CardTitle>Scenario-Based Questions ({questionBank.scenario.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questionBank.scenario.map((q, i) => (
                  <QuestionCard key={i} {...q} index={i} />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
