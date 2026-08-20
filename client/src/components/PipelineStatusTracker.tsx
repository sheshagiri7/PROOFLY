import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, FileText, Cpu, Check, Layers, ShieldCheck } from 'lucide-react';

export type PipelineStage = 
  | 'IDLE'
  | 'UPLOADING'
  | 'EXTRACTING'
  | 'SEGMENTING'
  | 'PARSING'
  | 'VERIFYING'
  | 'SCORING'
  | 'COMPLETED'
  | 'FAILED';

interface PipelineStatusTrackerProps {
  currentStage: PipelineStage;
  error?: string;
  errorMessage?: string;
}

const STAGES = [
  { id: 'UPLOADING', label: '1. Uploading', desc: 'Secure payload transport' },
  { id: 'EXTRACTING', label: '2. Text Extraction', desc: 'PDF / DOCX text layer check' },
  { id: 'SEGMENTING', label: '3. Segmentation', desc: '13-section allowlist normalizer' },
  { id: 'PARSING', label: '4. Deterministic Parser', desc: '13+ fields & status tagging' },
  { id: 'VERIFYING', label: '5. Evidence Verification', desc: 'Exact verbatim citation locator' },
  { id: 'SCORING', label: '6. AI Fit Scoring', desc: 'Weighted requirement matching' }
];

export const PipelineStatusTracker: React.FC<PipelineStatusTrackerProps> = ({ currentStage, error }) => {
  if (currentStage === 'IDLE') return null;

  const getStageIndex = (stage: PipelineStage) => {
    switch (stage) {
      case 'UPLOADING': return 0;
      case 'EXTRACTING': return 1;
      case 'SEGMENTING': return 2;
      case 'PARSING': return 3;
      case 'VERIFYING': return 4;
      case 'SCORING': return 5;
      case 'COMPLETED': return 6;
      case 'FAILED': return -1;
      default: return -1;
    }
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white tracking-wide">
            PROOFLY PIPELINE EXECUTION
          </h4>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
          {currentStage === 'COMPLETED' ? '100% COMPLETE' : currentStage}
        </span>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {STAGES.map((s, idx) => {
          const isDone = currentIndex > idx || currentStage === 'COMPLETED';
          const isCurrent = currentIndex === idx && currentStage !== 'COMPLETED';
          const isPending = currentIndex < idx && currentStage !== 'COMPLETED';

          return (
            <div
              key={s.id}
              className={`p-3 rounded-xl border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-blue-950/40 border-blue-500 text-blue-200 shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold">STAGE 0{idx + 1}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isCurrent && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
              </div>
              <p className="font-semibold text-white leading-tight">{s.label.split('. ')[1]}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
