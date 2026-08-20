import React from 'react';
import { History, ArrowRight, PlusCircle, MinusCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface ResumeEvolutionDiffProps {
  evolutionData?: {
    hasEvolutionHistory: boolean;
    baselineVersion?: string;
    currentVersion?: string;
    previousScore?: number;
    currentScore?: number;
    scoreDelta?: number;
    addedSkills?: string[];
    removedSkills?: string[];
    retainedSkills?: string[];
    titleChange?: { from: string; to: string };
    summary?: string;
  };
}

export const ResumeEvolutionDiff: React.FC<ResumeEvolutionDiffProps> = ({ evolutionData }) => {
  if (!evolutionData || !evolutionData.hasEvolutionHistory) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 text-center py-8">
        <History className="w-10 h-10 text-slate-600 mx-auto" />
        <h4 className="text-sm font-semibold text-white">Resume Evolution Tracker</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Upload an updated resume version (V2, V3) to visualize detected skill improvements and track your fit score progression over time.
        </p>
      </div>
    );
  }

  const {
    baselineVersion = 'V1',
    currentVersion = 'V2',
    previousScore = 64,
    currentScore = 87,
    scoreDelta = 23,
    addedSkills = ['FastAPI', 'Docker', 'AWS', 'Redis'],
    removedSkills = [],
    titleChange = { from: 'Software Engineer', to: 'Senior Software Engineer' },
    summary
  } = evolutionData;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <History className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                RESUME EVOLUTION DIFF
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                {baselineVersion} → {currentVersion}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Detected changes between resume versions backed by verifiable extraction.
            </p>
          </div>
        </div>

        {/* Score Progression */}
        <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className="text-center font-mono">
            <p className="text-[10px] text-slate-500">{baselineVersion} Score</p>
            <p className="text-sm font-bold text-slate-300">{previousScore}%</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="text-center font-mono">
            <p className="text-[10px] text-slate-500">{currentVersion} Score</p>
            <p className="text-base font-extrabold text-emerald-400">{currentScore}%</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            +{scoreDelta}%
          </div>
        </div>
      </div>

      {/* Summary statement */}
      {summary && (
        <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed font-mono">
          {summary}
        </p>
      )}

      {/* Changes Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Added Competencies */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
            <span className="flex items-center gap-1.5 font-mono uppercase text-[11px]">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> Added Skills ({addedSkills.length})
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              NEW EVIDENCE
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {addedSkills.map(skill => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-200"
              >
                +{skill}
              </span>
            ))}
          </div>
        </div>

        {/* Role / Seniority Change */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
            <span className="flex items-center gap-1.5 font-mono uppercase text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Title & Scope
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
              UPDATED
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <p className="text-slate-500 line-through">{titleChange.from}</p>
            <p className="font-semibold text-white flex items-center gap-1.5 text-blue-300">
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" /> {titleChange.to}
            </p>
          </div>
        </div>

        {/* Removed or Stale Items */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 font-mono uppercase text-[11px]">
              <MinusCircle className="w-3.5 h-3.5 text-slate-500" /> Removed Items ({removedSkills.length})
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              PRUNED
            </span>
          </div>
          {removedSkills.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No previous qualifications were removed.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {removedSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 line-through"
                >
                  -{skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
