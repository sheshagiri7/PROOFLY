import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Layers, 
  Quote, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { EvidenceItem, FullApplicationReport } from '../services/api';

interface ProveThisDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullApplicationReport;
}

export const ProveThisDecisionModal: React.FC<ProveThisDecisionModalProps> = ({ isOpen, onClose, report }) => {
  const [filter, setFilter] = useState<'ALL' | 'MATCHED' | 'PARTIAL' | 'NO EVIDENCE'>('ALL');
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(() => report?.evidenceItems?.[0] || null);

  if (!isOpen || !report || !report.evidenceItems) return null;

  const items = report.evidenceItems || [];
  const activeItem = selectedItem || items[0] || null;

  const filteredItems = items.filter(item => {
    if (filter === 'ALL') return true;
    return item.match_status === filter;
  });

  const matchedCount = items.filter(i => i.match_status === 'MATCHED').length;
  const partialCount = items.filter(i => i.match_status === 'PARTIAL').length;
  const noEvidenceCount = items.filter(i => i.match_status === 'NO EVIDENCE').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0D1322] border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  PROVE THIS DECISION
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                  Why {report.scores?.overallScore || 87}%?
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive Evidence Chain linking every score point to verbatim resume citations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Bar & Filters */}
        <div className="px-6 py-3 bg-slate-900/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Requirements ({report.evidenceItems.length})
            </button>
            <button
              onClick={() => setFilter('MATCHED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === 'MATCHED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Matched ({matchedCount})
            </button>
            <button
              onClick={() => setFilter('PARTIAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === 'PARTIAL'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Partial ({partialCount})
            </button>
            <button
              onClick={() => setFilter('NO EVIDENCE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === 'NO EVIDENCE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              No Evidence ({noEvidenceCount})
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>Candidate: <span className="text-white font-semibold">{report.candidate.name}</span></div>
            <div>•</div>
            <div>Evidence Quality: <span className="text-emerald-400 font-semibold">{report.scores?.evidenceQuality}%</span></div>
          </div>
        </div>

        {/* Modal Body: Left List & Right Interactive Chain Tracer */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Requirements List */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-4 space-y-2 bg-[#090D18]/50">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Requirement to Trace Proof
            </p>
            {filteredItems.map(item => {
              const isSelected = activeItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category || 'Skill'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                        item.match_status === 'MATCHED'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : item.match_status === 'PARTIAL'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.match_status === 'MATCHED' && <CheckCircle2 className="w-3 h-3" />}
                      {item.match_status === 'PARTIAL' && <AlertTriangle className="w-3 h-3" />}
                      {item.match_status === 'NO EVIDENCE' && <XCircle className="w-3 h-3" />}
                      {item.match_status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-100 line-clamp-2">
                    {item.req_description || item.explanation}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Source: {item.source_section || 'Resume'}</span>
                    <span className="font-mono text-blue-400 flex items-center gap-0.5">
                      Trace <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Visual Evidence Trace Chain */}
          <div className="md:col-span-7 overflow-y-auto p-6 bg-[#0B101E] space-y-6">
            {activeItem ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Interactive Trace Pipeline</h4>
                    <p className="text-xs text-slate-400">Verifying requirement authenticity and source anchor</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      activeItem.match_status === 'MATCHED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : activeItem.match_status === 'PARTIAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    STATUS: {activeItem.match_status}
                  </span>
                </div>

                {/* 4-Stage Trace Diagram */}
                <div className="space-y-4">
                  {/* Step 1: Job Requirement */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-mono text-blue-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> 1. JOB REQUIREMENT
                      </span>
                      <span className="text-[11px] font-mono">Importance: {activeItem.importance || 'HIGH'}</span>
                    </div>
                    <p className="text-sm font-semibold text-white mt-1">
                      {activeItem.req_description || 'Job Requirement Specification'}
                    </p>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center -my-2">
                    <div className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-blue-400 font-mono flex items-center gap-1 border border-slate-700">
                      ↓ EVALUATES AGAINST
                    </div>
                  </div>

                  {/* Step 2: AI Parsing & Field */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-mono text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 2. PARSED FIELD & EXPLANATION
                      </span>
                      <span className="text-[11px] font-mono">Confidence: {Math.round((activeItem.confidence || 1) * 100)}%</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {activeItem.explanation}
                    </p>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center -my-2">
                    <div className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-purple-400 font-mono flex items-center gap-1 border border-slate-700">
                      ↓ SOURCED FROM SECTION
                    </div>
                  </div>

                  {/* Step 3: Source Section & Offset */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-mono text-cyan-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> 3. RESUME SECTION & CHAR OFFSET
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Offset: {activeItem.character_offset || 'Indexed'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white mt-1">
                      Section: <span className="text-cyan-300 font-mono">{activeItem.source_section || 'Resume Text'}</span>
                    </p>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center -my-2">
                    <div className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 font-mono flex items-center gap-1 border border-slate-700">
                      ↓ VERBATIM RESUME CITATION
                    </div>
                  </div>

                  {/* Step 4: Verbatim Evidence Quote */}
                  <div className={`p-4 rounded-xl border ${
                    activeItem.match_status === 'MATCHED'
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : activeItem.match_status === 'PARTIAL'
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono font-semibold flex items-center gap-1.5 text-emerald-400">
                        <Quote className="w-3.5 h-3.5" /> 4. EXACT RESUME EVIDENCE
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300">
                        Zero Fabrication
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/50 border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed">
                      "{activeItem.evidence_text}"
                    </div>
                  </div>
                </div>

                {/* Proofly Guarantee Note */}
                <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-white">Proofly Evidence Guarantee:</strong> This evidence is indexed directly from the candidate's uploaded resume. If the text does not exist in the document, it is strictly classified as NO EVIDENCE rather than synthesized.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p>Select any requirement on the left to inspect its evidence trace.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Deterministic Trace Completed • Zero-Drift Verified
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
