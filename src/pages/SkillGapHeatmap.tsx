import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { mockCandidates, requiredSkillsList } from '@/data/mockData';

const allSkills = ['React', 'Python', 'AWS', 'PostgreSQL', 'Docker', 'TypeScript', 'Node.js', 'Kubernetes', 'GraphQL', 'Redis'];
const topCandidates = [...mockCandidates].sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);

function getMatchLevel(candidate: typeof mockCandidates[0], skill: string): 'strong' | 'partial' | 'missing' {
  if (candidate.skills.includes(skill)) return 'strong';
  const relatedMap: Record<string, string[]> = {
    'Kubernetes': ['Docker', 'AWS'],
    'GraphQL': ['REST APIs', 'Node.js'],
    'Redis': ['PostgreSQL', 'MongoDB'],
  };
  const related = relatedMap[skill] || [];
  if (related.some(r => candidate.skills.includes(r))) return 'partial';
  return 'missing';
}

const levelStyles = {
  strong: 'bg-emerald-500 text-white',
  partial: 'bg-amber-400 text-white',
  missing: 'bg-red-400 text-white',
};

const levelLabels = {
  strong: 'Strong Match',
  partial: 'Partial Match',
  missing: 'Missing Skill',
};

export function SkillGapHeatmap() {
  const [hovered, setHovered] = useState<{ candidate: string; skill: string; level: string } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Skill Gap Heatmap</h1>
        <p className="text-text-secondary text-sm mt-0.5">Interactive visualization of skills across all candidates.</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-xs text-text-secondary">Strong Match</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-400" />
          <span className="text-xs text-text-secondary">Partial Match</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-400" />
          <span className="text-xs text-text-secondary">Missing Skill</span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          {/* Hover tooltip */}
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed z-50 bg-text-primary text-white text-xs px-3 py-2 rounded-lg pointer-events-none"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <p className="font-semibold">{hovered.candidate}</p>
              <p>{hovered.skill}: <span className="font-medium">{hovered.level}</span></p>
            </motion.div>
          )}

          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-xs font-medium text-text-secondary w-36">Candidate</th>
                {allSkills.map(skill => (
                  <th key={skill} className="px-1 py-2 text-xs font-medium text-text-secondary text-center" style={{ minWidth: '72px' }}>
                    <span className="block transform -rotate-45 origin-left whitespace-nowrap ml-4">{skill}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="pt-8">
              {topCandidates.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2.5">
                    <div>
                      <p className="text-xs font-medium text-text-primary">{c.name.split(' ')[0]}</p>
                      <p className="text-xs text-emerald-600 font-semibold">{c.matchScore}%</p>
                    </div>
                  </td>
                  {allSkills.map(skill => {
                    const level = getMatchLevel(c, skill);
                    return (
                      <td key={skill} className="px-1 py-2.5 text-center">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          onMouseEnter={() => setHovered({ candidate: c.name, skill, level: levelLabels[level] })}
                          onMouseLeave={() => setHovered(null)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-default ${levelStyles[level]}`}
                          title={`${c.name} - ${skill}: ${levelLabels[level]}`}
                        >
                          {level === 'strong' ? '+' : level === 'partial' ? '~' : 'x'}
                        </motion.button>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Summary Row */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-text-secondary mb-2">Skill Coverage Across All Candidates</p>
            <div className="flex gap-2 flex-wrap">
              {allSkills.map(skill => {
                const strongCount = topCandidates.filter(c => getMatchLevel(c, skill) === 'strong').length;
                const pct = Math.round((strongCount / topCandidates.length) * 100);
                return (
                  <div key={skill} className="text-center">
                    <div className="text-xs font-bold text-text-primary">{pct}%</div>
                    <div className="text-xs text-text-secondary">{skill}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
