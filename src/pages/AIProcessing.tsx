import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileSearch, FileText, User, GitCompare, BarChart2, Sparkles,
  CheckCircle2, Clock, Play, ChevronRight, Cpu, Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { agentWorkflow } from '@/data/mockData';

const iconMap: Record<string, React.ElementType> = {
  FileSearch, FileText, User, GitCompare, BarChart2, Sparkles,
};

type AgentStatus = 'pending' | 'running' | 'complete';

interface AgentState {
  id: number;
  status: AgentStatus;
  progress: number;
  log: string;
}

const agentLogs: Record<number, string[]> = {
  1: ['Reading job description...', 'Extracting skills...', 'Identifying requirements...', 'JD analysis complete.'],
  2: ['Loading resumes...', 'Parsing PDF files...', 'Extracting text content...', 'Resume parsing complete.'],
  3: ['Building profiles...', 'Normalizing data...', 'Structuring experience...', 'Profiles built.'],
  4: ['Comparing profiles...', 'Calculating similarity...', 'Scoring matches...', 'Matching complete.'],
  5: ['Applying weights...', 'Ranking candidates...', 'Sorting by score...', 'Ranking complete.'],
  6: ['Generating insights...', 'Creating recommendations...', 'Writing summaries...', 'Recommendations ready.'],
};

export function AIProcessing() {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    agentWorkflow.map(a => ({ id: a.id, status: 'pending', progress: 0, log: '' }))
  );
  const [currentLog, setCurrentLog] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState(0);

  const runAgents = () => {
    setRunning(true);
    setDone(false);
    setAgentStates(agentWorkflow.map(a => ({ id: a.id, status: 'pending', progress: 0, log: '' })));
    setOverallProgress(0);

    agentWorkflow.forEach((agent, idx) => {
      const delay = idx * 2500;
      setTimeout(() => {
        setAgentStates(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'running' } : a));
        const logs = agentLogs[agent.id];
        logs.forEach((log, li) => {
          setTimeout(() => {
            setCurrentLog(`[Agent ${agent.id}] ${log}`);
            const progress = Math.round(((li + 1) / logs.length) * 100);
            setAgentStates(prev => prev.map(a => a.id === agent.id ? { ...a, progress, log } : a));
            setOverallProgress(Math.round(((idx + (li + 1) / logs.length) / agentWorkflow.length) * 100));
          }, li * 500);
        });
        setTimeout(() => {
          setAgentStates(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'complete', progress: 100 } : a));
          if (idx === agentWorkflow.length - 1) {
            setTimeout(() => { setRunning(false); setDone(true); setOverallProgress(100); }, 300);
          }
        }, logs.length * 500 + 200);
      }, delay);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">AI Agent Workflow</h1>
          <p className="text-text-secondary text-sm mt-0.5">Live visualization of the AI pipeline processing your candidates.</p>
        </div>
        {!running && !done && (
          <Button onClick={runAgents} size="lg" className="gap-2">
            <Play size={15} />
            Start AI Pipeline
          </Button>
        )}
        {done && (
          <Button onClick={() => navigate('/dashboard/candidates?tab=rankings')} className="gap-2">
            View Rankings <ChevronRight size={15} />
          </Button>
        )}
      </div>

      {/* Overall Progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-primary-600" />
            <span className="text-sm font-semibold text-text-primary">
              {done ? 'Pipeline Complete' : running ? 'Processing...' : 'Ready to Run'}
            </span>
          </div>
          <span className="text-sm font-bold text-primary-600">{overallProgress}%</span>
        </div>
        <ProgressBar value={overallProgress} size="lg" color={done ? '#10B981' : '#2563EB'} />
        {running && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-text-secondary mt-2 font-mono">
            {currentLog}
          </motion.p>
        )}
      </Card>

      {/* Agent Steps */}
      <div className="space-y-3">
        {agentWorkflow.map((agent, i) => {
          const state = agentStates.find(a => a.id === agent.id)!;
          const IconComp = iconMap[agent.icon] || Sparkles;
          const isActive = state.status === 'running';
          const isDone = state.status === 'complete';

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className={`overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-primary-500 shadow-card-hover' : ''}`}>
                <div className="flex items-center gap-4 p-4">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isDone ? 'bg-emerald-500' : isActive ? 'bg-primary-600' : 'bg-gray-100'
                      }`}
                    >
                      {isDone
                        ? <CheckCircle2 size={18} className="text-white" />
                        : isActive
                        ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                            <Zap size={18} className="text-white" />
                          </motion.div>
                        : <IconComp size={18} className="text-text-secondary" />
                      }
                    </div>
                    {i < agentWorkflow.length - 1 && (
                      <div className={`w-0.5 h-4 rounded-full ${isDone ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-text-secondary">Step {agent.id}</span>
                      {isActive && (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="text-xs text-primary-600 font-medium"
                        > Running Processing</motion.span>
                      )}
                      {isDone && <span className="text-xs text-emerald-600 font-medium">Complete</span>}
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{agent.name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{agent.description}</p>
                    {isActive && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-primary-600 font-mono mt-1">
                        {state.log}
                      </motion.p>
                    )}
                    {isActive && <ProgressBar value={state.progress} size="sm" className="mt-2 max-w-xs" />}
                  </div>

                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={11} /> Done
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                        <Clock size={11} className="animate-pulse" /> Running
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary bg-gray-50 px-2.5 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 text-center"
        >
          <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-1">AI Analysis Complete!</h3>
          <p className="text-sm text-text-secondary mb-4">All 10 candidates have been ranked and analyzed.</p>
          <Button onClick={() => navigate('/dashboard/candidates?tab=rankings')} className="gap-2">
            View Candidate Rankings <ChevronRight size={15} />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
