import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

const QUICK_QUESTIONS = [
  'Why is Candidate A ranked first?',
  'Compare top 5 candidates',
  'Suggest interview questions',
  'Show missing skills',
  'Recommend best candidate',
];

const BOT_RESPONSES: Record<string, string> = {
  'why is candidate a ranked first?': "Sarah Johnson is ranked #1 with a 94% match score because she has 6 years of experience (exceeds the 5-year requirement), holds 8/9 required skills including React, Python, AWS, and Docker, has AWS certification, and demonstrates strong leadership experience. Her technical fit is 95% and culture fit is 90%.",
  'compare top 5 candidates': "Top 5 comparison:\n1. Sarah Johnson — 94% (Strong across all dimensions)\n2. David Lee — 91% (Great skills, Master's degree)\n3. Emily Chen — 89% (Full-stack + GraphQL)\n4. Lisa Anderson — 88% (Balanced profile)\n5. Priya Patel — 85% (Senior experience, Java stack)",
  'suggest interview questions': "For the top candidate Sarah Johnson, I recommend:\n• Technical: 'How have you architected React applications for millions of users?'\n• AWS: 'Describe your experience with ECS and Lambda for microservices.'\n• Behavioral: 'Tell me about a time you led a team through a production incident.'",
  'show missing skills': "Most common skill gaps across all candidates:\n• Terraform: 70% missing\n• Kubernetes: 60% missing\n• GraphQL: 50% missing\n• Redis: 60% missing\n\nConsider adding training paths for shortlisted candidates.",
  'recommend best candidate': "I strongly recommend Sarah Johnson for immediate hire. She has 94% match score, exceeds experience requirements, holds AWS certification, and demonstrates strong leadership. Risk level: Low. Hiring confidence: 94%.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key.split(' ')[0]) || lower.includes(key.split(' ')[1] || '')) return val;
  }
  return "I'm analyzing the candidate pool for your query. Based on the current JD for Senior Full Stack Developer, I have 10 candidates analyzed with an average match score of 84%. Would you like me to focus on a specific aspect?";
}

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      text: "Hello! I'm your AI Recruiter Copilot. Ask me anything about your candidates or job descriptions!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, time }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: getResponse(text), time }]);
    }, 1200);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 btn-gradient rounded-full shadow-lg flex items-center justify-center text-white"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <Sparkles size={22} />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">AI Recruiter Copilot</p>
                <p className="text-xs text-primary-200">Powered by GPT-4o</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-primary-200">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin" style={{ maxHeight: '300px' }}>
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-primary-600' : 'bg-gray-200'}`}>
                    {msg.role === 'ai' ? <Sparkles size={13} className="text-white" /> : <User size={13} className="text-text-secondary" />}
                  </div>
                  <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === 'ai' ? 'bg-gray-50 text-text-primary' : 'bg-primary-600 text-white'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-text-secondary mt-0.5 px-1">{msg.time}</span>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-2 items-end">
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-2xl flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 bg-text-secondary rounded-full" />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-3 pb-2">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="flex-shrink-0 text-xs bg-primary-50 text-primary-700 px-2.5 py-1.5 rounded-full hover:bg-primary-100 transition-colors border border-primary-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask about candidates..."
                className="flex-1 px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="w-9 h-9 btn-gradient rounded-xl flex items-center justify-center text-white hover:btn-gradient-hover transition-all disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
