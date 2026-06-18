import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Save, CheckCircle2, Sliders, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}

function WeightSlider({ label, value, onChange, color }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <span className="text-sm font-bold" style={{ color }}>{value}%</span>
      </div>
      <input
        type="range" min={0} max={100} step={5} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color }}
      />
    </div>
  );
}

export function Settings() {
  const [model, setModel] = useState<'gpt4o' | 'gemini'>('gpt4o');
  const [saved, setSaved] = useState(false);
  const [weights, setWeights] = useState({
    skills: 40,
    experience: 30,
    projects: 20,
    education: 10,
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const weightColors = { skills: '#2563EB', experience: '#10B981', projects: '#F59E0B', education: '#8B5CF6' };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm mt-0.5">Configure AI models and scoring weights.</p>
      </div>

      {/* AI Model Selection */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 py-3">
          <Cpu size={15} className="text-primary-600" />
          <CardTitle>AI Model Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-secondary">Select the AI model for resume analysis and candidate matching.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'gpt4o',
                name: 'GPT-4o',
                provider: 'OpenAI',
                badge: 'Recommended',
                desc: 'Best accuracy for resume parsing and JD matching. Higher context window.',
                color: '#10B981',
              },
              {
                id: 'gemini',
                name: 'Gemini 2.5 Pro',
                provider: 'Google',
                badge: 'Fast',
                desc: 'Excellent performance with strong reasoning and code understanding.',
                color: '#2563EB',
              },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setModel(m.id as 'gpt4o' | 'gemini')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  model === m.id ? 'border-primary-500 bg-primary-50' : 'border-border hover:border-primary-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{m.name}</p>
                    <p className="text-xs text-text-secondary">{m.provider}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.id === 'gpt4o' ? 'success' : 'default'} className="text-xs">{m.badge}</Badge>
                    {model === m.id && (
                      <div className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{m.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Weights */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 py-3">
          <Sliders size={15} className="text-primary-600" />
          <CardTitle>Scoring Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary">Configure the weight of each factor in the candidate score.</p>
            <Badge variant={totalWeight === 100 ? 'success' : 'error'} className="text-xs">
              Total: {totalWeight}%
            </Badge>
          </div>

          <WeightSlider label="Skill Match" value={weights.skills} onChange={v => setWeights(w => ({ ...w, skills: v }))} color={weightColors.skills} />
          <WeightSlider label="Experience Match" value={weights.experience} onChange={v => setWeights(w => ({ ...w, experience: v }))} color={weightColors.experience} />
          <WeightSlider label="Projects & Portfolio" value={weights.projects} onChange={v => setWeights(w => ({ ...w, projects: v }))} color={weightColors.projects} />
          <WeightSlider label="Education" value={weights.education} onChange={v => setWeights(w => ({ ...w, education: v }))} color={weightColors.education} />

          {/* Visual distribution */}
          <div className="h-3 rounded-full overflow-hidden flex">
            {Object.entries(weights).map(([k, v], i) => (
              <motion.div
                key={k}
                animate={{ width: `${v}%` }}
                transition={{ duration: 0.3 }}
                className="h-full"
                style={{ backgroundColor: Object.values(weightColors)[i] }}
                title={`${k}: ${v}%`}
              />
            ))}
          </div>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(weights).map(([k, v], i) => (
              <div key={k} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: Object.values(weightColors)[i] }} />
                <span className="text-xs text-text-secondary capitalize">{k} {v}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 py-3">
          <Brain size={15} className="text-primary-600" />
          <CardTitle>AI Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Auto-analyze uploaded resumes', sub: 'Automatically run AI analysis when resumes are uploaded', default: true },
            { label: 'Generate interview questions', sub: 'Auto-generate questions for shortlisted candidates', default: true },
            { label: 'Email notifications', sub: 'Receive email updates when analysis is complete', default: false },
            { label: 'Show confidence scores', sub: 'Display AI confidence percentages on all recommendations', default: true },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-text-primary">{s.label}</p>
                <p className="text-xs text-text-secondary">{s.sub}</p>
              </div>
              <ToggleSwitch defaultOn={s.default} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="gap-2">
          {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Settings</>}
        </Button>
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(v => !v)}
      className={`w-11 h-6 rounded-full transition-colors relative ${on ? 'bg-primary-600' : 'bg-gray-200'}`}
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ duration: 0.2 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}
