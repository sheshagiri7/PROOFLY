import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Zap, 
  Sliders, 
  BarChart3, 
  Info, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface EvidenceCitation {
  title: string;
  section: string;
  snippet: string;
  status: 'VERIFIED' | 'SUPPORTED' | 'NO_EVIDENCE';
  evidenceId?: string;
  requirementId?: string;
}

interface ActionItem {
  id: string;
  type: string;
  label: string;
  payload: any;
  requiresConfirmation: boolean;
}

interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  why?: string;
  evidence?: EvidenceCitation[];
  impact?: string;
  whatsMissing?: string;
  nextStep?: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceReason?: string;
  modelUsed?: string;
  actions?: ActionItem[];
  simulationResult?: any;
  comparisonData?: any[];
  suggestedPrompts?: string[];
  isStreaming?: boolean;
}

interface ProoflyCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  candidateId?: string;
  jobId?: string;
  candidateName?: string;
  jobTitle?: string;
  overallScore?: number;
  onOpenEvidenceChain?: (evidenceId?: string) => void;
  onOpenSimulator?: (simData?: any) => void;
}

export const ProoflyCopilot: React.FC<ProoflyCopilotProps> = ({
  isOpen,
  onClose,
  applicationId = 'app-1',
  candidateId = 'cand-1',
  jobId = 'job-1',
  candidateName = 'Alex Rivera',
  jobTitle = 'Senior Full-Stack Engineer',
  overallScore = 87,
  onOpenEvidenceChain,
  onOpenSimulator
}) => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReasoningSources, setShowReasoningSources] = useState(false);
  const [actionConfirmation, setActionConfirmation] = useState<{ action: ActionItem; messageId: string } | null>(null);

  const role = user?.role || 'RECRUITER';

  const defaultPrompts = role === 'CANDIDATE' ? [
    'What are my strongest skills?',
    'Where is my resume evidence weak?',
    'What requirements am I missing evidence for?',
    'How can I strengthen my resume proof?'
  ] : role === 'ADMIN' ? [
    'How many resumes failed extraction?',
    'What is the parser failure rate?',
    'Show system reliability issues',
    'Summarize recent processing failures'
  ] : [
    'Why did this candidate get 87%?',
    'Why not 100%?',
    'Show me evidence for AWS',
    'Simulate AWS weight at 5%',
    'Compare candidate pool'
  ];

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'copilot',
      text: `Welcome to **PROOFLY COPILOT™️**. I am an evidence-grounded recruitment intelligence assistant bound to verified database records.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      why: `I process extracted resume fields, verified requirement citations, and deterministic scoring models without speculative hallucination.`,
      confidence: 'HIGH',
      confidenceReason: 'All claims are linked to immutable database evidence entries.',
      modelUsed: 'PROOFLY Grounded Copilot Engine',
      suggestedPrompts: defaultPrompts
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const streamTypewriter = (fullResponse: any, botMsgId: string) => {
    const fullText = fullResponse.answer || 'Response generated.';
    const words = fullText.split(' ');
    let wordIdx = 0;

    const interval = setInterval(() => {
      wordIdx++;
      const partialText = words.slice(0, wordIdx).join(' ');

      setMessages(prev =>
        prev.map(m => {
          if (m.id === botMsgId) {
            return {
              ...m,
              text: partialText,
              isStreaming: wordIdx < words.length
            };
          }
          return m;
        })
      );

      if (wordIdx >= words.length) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 20);
  };

  const handleSend = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim() || loading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.queryCopilot({
        message: query.trim(),
        sessionId,
        candidateId,
        jobId,
        applicationId
      });

      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      const botMsgId = `bot-${Date.now()}`;
      const placeholder: CopilotMessage = {
        id: botMsgId,
        sender: 'copilot',
        text: '',
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        why: response.why,
        evidence: response.evidence,
        impact: response.impact,
        whatsMissing: response.whatsMissing,
        nextStep: response.nextStep,
        confidence: response.confidence,
        confidenceReason: response.confidenceReason,
        modelUsed: response.modelUsed,
        actions: response.actions,
        simulationResult: response.simulationResult,
        comparisonData: response.comparisonData,
        suggestedPrompts: response.suggestedPrompts
      };

      setMessages(prev => [...prev, placeholder]);
      streamTypewriter(response, botMsgId);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'copilot',
          text: `I couldn't safely verify that answer from the available PROOFLY evidence: ${err.message || 'Processing error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: 'LOW',
          confidenceReason: 'Database or tool execution failed.'
        }
      ]);
      setLoading(false);
    }
  };

  const handleConfirmAction = async (action: ActionItem) => {
    try {
      setLoading(true);
      const res = await api.confirmCopilotAction(action.id, action.type, action.payload);
      setActionConfirmation(null);

      setMessages(prev => [
        ...prev,
        {
          id: `act-res-${Date.now()}`,
          sender: 'copilot',
          text: `✅ **ACTION CONFIRMED**: ${res.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: 'HIGH',
          confidenceReason: 'Action executed directly against authenticated database pipeline.'
        }
      ]);
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearContext = async () => {
    if (sessionId) {
      await api.clearCopilotSession(sessionId).catch(() => {});
    }
    setSessionId(undefined);
    setMessages([
      {
        id: `init-reset-${Date.now()}`,
        sender: 'copilot',
        text: `Context reset complete. PROOFLY COPILOT™️ memory has been cleared.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 'HIGH',
        confidenceReason: 'Fresh context initialized.',
        suggestedPrompts: defaultPrompts
      }
    ]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#090E1A] border-l border-slate-800 shadow-2xl flex flex-col animate-slideLeft font-sans">
      {/* Copilot Header & Context Engine Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wider">PROOFLY COPILOT™️</h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                  {role} MODE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Ask Anything • Get The Proof • Zero Drift Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearContext}
              title="Clear Chat & Reset Context"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Active Context Badge */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Candidate: <strong className="text-white">{candidateName}</strong></span>
            <span>•</span>
            <span>Role: <strong className="text-slate-200">{jobTitle}</strong></span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
              PROOF SCORE: {overallScore}%
            </span>
            <button
              onClick={() => setShowReasoningSources(!showReasoningSources)}
              className="text-slate-400 hover:text-slate-200 underline"
            >
              {showReasoningSources ? 'Hide Sources' : 'Reasoning Sources'}
            </button>
          </div>
        </div>

        {/* Core Philosophy Banner */}
        <div className="mt-2 text-[10px] font-mono text-center text-slate-400 tracking-wide uppercase">
          AI Explains • Evidence Proves • Humans Decide
        </div>
      </div>

      {/* Reasoning Sources Overlay Drawer */}
      {showReasoningSources && (
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs space-y-2 animate-fadeIn">
          <p className="font-mono text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Context Factors Indexed:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
            <div>✓ Python Backend Requirement (25%)</div>
            <div>✓ PostgreSQL Database Query (20%)</div>
            <div>✓ Docker Container Pipelines (15%)</div>
            <div>⚠ AWS EC2/S3 Partial Evidence (15%)</div>
            <div>✕ Kubernetes Cluster Management (5%)</div>
            <div>✕ Cloud Certification Credentials (5%)</div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            {/* Main Bubble */}
            <div
              className={`p-4 rounded-2xl max-w-[92%] space-y-3 ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              {/* Confidence Badge */}
              {m.confidence && m.sender === 'copilot' && (
                <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-800/80 pb-2">
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 ${
                      m.confidence === 'HIGH'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : m.confidence === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {m.confidence === 'HIGH' && <CheckCircle2 className="w-3 h-3" />}
                    {m.confidence === 'MEDIUM' && <AlertTriangle className="w-3 h-3" />}
                    {m.confidence === 'LOW' && <XCircle className="w-3 h-3" />}
                    CONFIDENCE: {m.confidence}
                  </span>
                  <span className="text-slate-400 italic truncate max-w-[200px]">
                    {m.confidenceReason}
                  </span>
                </div>
              )}

              {/* Main Answer Text */}
              <div className="leading-relaxed whitespace-pre-line text-xs font-sans">
                {m.text}
                {m.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle" />
                )}
              </div>

              {/* Structured Response Sections (Spec 69.7) */}
              {!m.isStreaming && m.sender === 'copilot' && (
                <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
                  {/* WHY */}
                  {m.why && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                      <p className="font-mono text-blue-400 uppercase text-[9px] font-bold">WHY:</p>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{m.why}</p>
                    </div>
                  )}

                  {/* EVIDENCE CITATIONS */}
                  {m.evidence && m.evidence.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
                      <p className="font-mono text-blue-300 uppercase text-[9px] font-bold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-400" /> VERIFIED EVIDENCE CITATIONS:
                      </p>
                      {m.evidence.map((e, eIdx) => (
                        <div key={eIdx} className="text-[11px] space-y-1 border-t border-slate-800/80 pt-1.5 first:border-0 first:pt-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{e.title}</span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                e.status === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : e.status === 'SUPPORTED'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {e.status}
                            </span>
                          </div>
                          <p className="text-slate-300 font-mono italic">"{e.snippet}"</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>Source: {e.section}</span>
                            {onOpenEvidenceChain && (
                              <button
                                onClick={() => onOpenEvidenceChain(e.evidenceId)}
                                className="text-blue-400 hover:text-blue-300 font-mono flex items-center gap-0.5 underline"
                              >
                                View Evidence Chain <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* IMPACT */}
                  {m.impact && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                      <p className="font-mono text-purple-400 uppercase text-[9px] font-bold">IMPACT:</p>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{m.impact}</p>
                    </div>
                  )}

                  {/* WHAT'S MISSING */}
                  {m.whatsMissing && (
                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-[11px]">
                      <p className="font-mono text-rose-300 uppercase text-[9px] font-bold">WHAT'S MISSING:</p>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{m.whatsMissing}</p>
                    </div>
                  )}

                  {/* NEXT STEP */}
                  {m.nextStep && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px]">
                      <p className="font-mono text-emerald-300 uppercase text-[9px] font-bold">RECOMMENDED NEXT STEP:</p>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{m.nextStep}</p>
                    </div>
                  )}

                  {/* Miniature Visual Proof Chain Signature (Spec 69.19) */}
                  {m.why && (
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-950 to-indigo-950/40 border border-blue-500/20 text-[10px] font-mono space-y-1">
                      <p className="text-slate-400 uppercase font-bold">Visual Proof Chain Signature:</p>
                      <div className="flex items-center justify-between text-slate-300 overflow-x-auto gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">{overallScore}% PROOF SCORE</span>
                        <span>→</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Backend</span>
                        <span>→</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Python</span>
                        <span>→</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Experience</span>
                        <span>→</span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Verified Evidence</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons (Spec 69.8) */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {m.actions.map((act) => (
                        <button
                          key={act.id}
                          onClick={() => {
                            if (act.requiresConfirmation) {
                              setActionConfirmation({ action: act, messageId: m.id });
                            } else if (act.type === 'OPEN_EVIDENCE_CHAIN' && onOpenEvidenceChain) {
                              onOpenEvidenceChain();
                            } else if (act.type === 'OPEN_SIMULATOR' && onOpenSimulator) {
                              onOpenSimulator(act.payload);
                            } else {
                              handleConfirmAction(act);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                            act.requiresConfirmation
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="text-[9px] font-mono text-slate-500 px-1">{m.timestamp}</span>

            {/* Preset Suggested Prompts */}
            {m.suggestedPrompts && m.suggestedPrompts.length > 0 && !m.isStreaming && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-w-[92%]">
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

        {loading && !messages.some(m => m.isStreaming) && (
          <div className="flex items-center gap-2 text-slate-400 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs w-max">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
            <span>Constructing permission-aware context & running evidence validation...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Confirmation Modal for Action Execution (Spec 69.8) */}
      {actionConfirmation && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>CONFIRMATION REQUIRED: {actionConfirmation.action.label}</span>
          </div>
          <p className="text-xs text-slate-300">
            Are you sure you want to execute <strong className="text-white">{actionConfirmation.action.label}</strong> for candidate {candidateName}?
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setActionConfirmation(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300"
            >
              CANCEL
            </button>
            <button
              onClick={() => handleConfirmAction(actionConfirmation.action)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20"
            >
              CONFIRM ACTION
            </button>
          </div>
        </div>
      )}

      {/* Footer Query Input Form */}
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
            placeholder="Ask PROOFLY COPILOT™️ (e.g. Why 87%? Why not 100%? Show AWS evidence...)"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all disabled:opacity-40 shadow-md shadow-blue-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
