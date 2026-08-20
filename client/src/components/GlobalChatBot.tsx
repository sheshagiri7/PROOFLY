import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  FileText, 
  ArrowRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  modelUsed?: string;
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
  'What requirements are missing?'
];

export const GlobalChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "👋 Hi! I'm **PROOFLY LLM** — an evidence-first AI language model designed for recruitment intelligence. Every response is generated via zero-hallucination resume section citations.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Gemini 2.5 Flash / PROOFLY LLM',
      suggestedPrompts: INITIAL_PROMPTS
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
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

    try {
      // Call LLM Chat Backend API
      const historyPayload = messages.map(m => ({ sender: m.sender, text: m.text }));
      const llmResponse = await api.llmChat(text.trim(), 'app-1', historyPayload);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: llmResponse.answer || 'LLM model response received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: llmResponse.modelUsed || 'PROOFLY Grounded LLM Engine',
        citations: llmResponse.evidenceCitations,
        suggestedPrompts: llmResponse.suggestedFollowUps
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ **LLM Model Error**: Unable to reach AI inference engine (${err.message || 'Network error'}).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'LLM Error Handler'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 group flex items-center gap-2.5 border border-blue-400/30"
        title="Open PROOFLY LLM Chatbot"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#070B14] animate-pulse" />
        </div>
        <span className="hidden sm:inline-block font-semibold text-xs tracking-wide">
          {isOpen ? 'Close LLM' : 'Ask PROOFLY LLM'}
        </span>
      </button>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[600px] h-[80vh] bg-[#0A0F1D] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn backdrop-blur-xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-blue-950/70 via-slate-900 to-purple-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white tracking-wide">PROOFLY LLM</h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                    LIVE LLM
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Google GenAI / Evidence Grounded Engine</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
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

                  {/* Model Tag */}
                  {m.modelUsed && m.sender === 'bot' && (
                    <div className="pt-1 flex items-center gap-1 text-[9px] font-mono text-purple-400">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Model: {m.modelUsed}</span>
                    </div>
                  )}

                  {/* Citations Box */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-purple-500/25 space-y-2 mt-2">
                      <p className="font-mono text-purple-300 text-[10px] uppercase font-bold flex items-center gap-1">
                        <FileText className="w-3 h-3 text-purple-400" /> Exact LLM Evidence Citations:
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

                {/* Suggested Follow-up Chips */}
                {m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                    {m.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSend(prompt)}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-purple-500/50 transition-all text-left flex items-center gap-1 group"
                      >
                        <span>{prompt}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs w-max">
                <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>Generating LLM inference & grounding facts...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
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
                placeholder="Ask PROOFLY LLM model anything..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-40"
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
