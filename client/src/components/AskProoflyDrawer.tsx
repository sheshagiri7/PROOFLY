import React, { useState } from 'react';
import { Sparkles, Send, X, ShieldCheck, FileText, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  sender: 'user' | 'proofly';
  text: string;
  groundedFacts?: string[];
  evidenceCitations?: Array<{
    title: string;
    section: string;
    snippet: string;
    status: 'VERIFIED' | 'SUPPORTED' | 'NO_EVIDENCE';
  }>;
  suggestedFollowUps?: string[];
}

interface AskProoflyDrawerProps {
  applicationId: string;
  candidateName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AskProoflyDrawer: React.FC<AskProoflyDrawerProps> = ({
  applicationId,
  candidateName,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'proofly',
      text: `Hello! I am ASK PROOFLY, your evidence-grounded hiring assistant. Every answer I give is strictly backed by verified text in ${candidateName}'s resume.`,
      groundedFacts: [
        'Deterministic zero-drift evidence verification enabled.',
        'Strict zero-hallucination guardrail active.'
      ],
      suggestedFollowUps: [
        'Why is this candidate a strong backend match?',
        'What requirements are missing?',
        'Show me evidence for AWS',
        'Why did PROOFLY give 87% match?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await api.askProofly(applicationId, query);
      const prooflyMsg: Message = {
        sender: 'proofly',
        text: response.answer,
        groundedFacts: response.groundedFacts,
        evidenceCitations: response.evidenceCitations,
        suggestedFollowUps: response.suggestedFollowUps
      };
      setMessages(prev => [...prev, prooflyMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'proofly',
          text: `Error querying evidence repository: ${err.message || 'Unknown error'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0A0F1E] border-l border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-wide">ASK PROOFLY™</h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                EVIDENCE GROUNDED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Recruiter AI Assistant • Zero Hallucination Mode</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-sans text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div
              className={`p-4 rounded-2xl max-w-[90%] space-y-2.5 ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

              {/* Grounded facts */}
              {m.groundedFacts && m.groundedFacts.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-[11px]">
                  <p className="font-mono text-slate-400 uppercase text-[9px] font-bold">Grounded Insights:</p>
                  {m.groundedFacts.map((fact, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-1.5 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Evidence Citations */}
              {m.evidenceCitations && m.evidenceCitations.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/20 space-y-2">
                  <p className="font-mono text-blue-400 uppercase text-[9px] font-bold flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Exact Resume Citations:
                  </p>
                  {m.evidenceCitations.map((c, cIdx) => (
                    <div key={cIdx} className="text-[11px] space-y-1 border-t border-slate-800/60 pt-1.5 first:border-0 first:pt-0">
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

            {/* Suggested Follow-ups */}
            {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && idx === messages.length - 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {m.suggestedFollowUps.map((fu, fuIdx) => (
                  <button
                    key={fuIdx}
                    onClick={() => handleSend(fu)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-[10px] text-slate-300 transition-all text-left"
                  >
                    {fu}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs w-max">
            <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Grounded verification in progress...</span>
          </div>
        )}
      </div>

      {/* Query Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about skills, gaps, citations, or score..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
