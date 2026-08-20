import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  UserCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  citations?: Array<{
    title: string;
    section: string;
    snippet: string;
  }>;
  suggestedPrompts?: string[];
}

const INITIAL_PROMPTS = [
  'Why is Alex Rivera an 87% match?',
  'How does zero-bias blind screening work?',
  'What evidence is verified for Docker & AWS?',
  'How is candidate proof score calculated?'
];

export const GlobalChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "👋 Hi! I'm PROOFLY AI — your evidence-first hiring assistant. I answer questions using zero-hallucination resume citations and evidence verification.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: INITIAL_PROMPTS
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const generateBotResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (q.includes('alex rivera') || q.includes('87%') || q.includes('match') || q.includes('score')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Alex Rivera scored **87% overall match** for Senior Full-Stack Engineer at Synthetix Cloud Labs based on verified evidence in 6 core requirements.',
        timestamp: now,
        citations: [
          {
            title: 'Python & FastAPI APIs',
            section: 'Experience (Apex Cloud Systems)',
            snippet: 'Developed high-performance Python APIs using FastAPI and asynchronous task workers handling 15M+ requests/day.'
          },
          {
            title: 'PostgreSQL Latency Tuning',
            section: 'Experience (Apex Cloud Systems)',
            snippet: 'Optimized complex PostgreSQL database queries and connection pools, reducing p99 latency from 450ms to 42ms.'
          },
          {
            title: 'Docker Container Pipelines',
            section: 'Experience & Projects',
            snippet: 'Built automated Docker container pipelines and integrated continuous testing; OpenSync Distributed Event Bus in Python & Redis.'
          }
        ],
        suggestedPrompts: [
          'What requirements were partial or missing?',
          'How does blind screening work for Alex?',
          'Export PDF Evaluation Report'
        ]
      };
    }

    if (q.includes('blind') || q.includes('bias') || q.includes('screening') || q.includes('cand-8f2a')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '🛡️ **PROOFLY Blind Screening Toggle** anonymizes candidate identities to eliminate demographic and prestige bias:\n\n• Hides names, photos, gender markers, and exact institution names.\n• Generates immutable blind codes (e.g. `CAND-8F2A`).\n• Evaluates candidates strictly on **verifiable skill evidence**.',
        timestamp: now,
        suggestedPrompts: [
          'Why is Alex Rivera an 87% match?',
          'What evidence is verified for Docker & AWS?',
          'How are proof scores calculated?'
        ]
      };
    }

    if (q.includes('docker') || q.includes('aws') || q.includes('evidence') || q.includes('skills')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '🔍 **Verified Skill Citations for Alex Rivera**:\n\n• **Docker**: MATCHED (100%) — Built automated Docker pipelines at Apex Cloud Systems and containerized legacy services at DataTech Solutions.\n• **AWS (EC2 & S3)**: PARTIAL (80%) — Verified asset storage deployment on EC2/S3, but lacks Kubernetes cluster orchestration evidence.',
        timestamp: now,
        citations: [
          {
            title: 'AWS EC2 & S3 Deployment',
            section: 'Experience',
            snippet: 'Deployed auxiliary microservices to AWS EC2 and S3 for scalable asset storage.'
          }
        ],
        suggestedPrompts: [
          'Why is Alex Rivera an 87% match?',
          'How does zero-bias blind screening work?'
        ]
      };
    }

    // Generic fallback
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `I verified your query regarding "${query}". PROOFLY evaluates candidates using deterministic requirement parsing, zero-hallucination resume section citations, and objective proof chains.`,
      timestamp: now,
      suggestedPrompts: [
        'Why is Alex Rivera an 87% match?',
        'How does zero-bias blind screening work?',
        'What evidence is verified for Docker & AWS?'
      ]
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 group flex items-center gap-2 border border-blue-400/30"
        title="Open PROOFLY AI Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#070B14] animate-pulse" />
        </div>
        <span className="hidden sm:inline-block font-semibold text-xs tracking-wide">
          {isOpen ? 'Close AI Chat' : 'Ask PROOFLY™'}
        </span>
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[600px] h-[80vh] bg-[#0A0F1D] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn backdrop-blur-xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white tracking-wide">PROOFLY AI</h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Zero-Hallucination Evidence Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[88%] space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>

                  {/* Citations Box */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-blue-500/25 space-y-2 mt-2">
                      <p className="font-mono text-blue-400 text-[10px] uppercase font-bold flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Verbatim Citations:
                      </p>
                      {m.citations.map((c, idx) => (
                        <div key={idx} className="text-[10px] space-y-0.5 border-t border-slate-800/80 pt-1.5 first:border-0 first:pt-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{c.title}</span>
                            <span className="text-[9px] font-mono text-slate-400">{c.section}</span>
                          </div>
                          <p className="text-slate-300 font-mono italic">"{c.snippet}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[9px] font-mono text-slate-500 px-1">{m.timestamp}</span>

                {/* Suggested Prompt Chips */}
                {m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                    {m.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSend(prompt)}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-blue-500/50 transition-all text-left flex items-center gap-1 group"
                      >
                        <span>{prompt}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs w-max">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Searching verified evidence citations...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask PROOFLY AI anything..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
