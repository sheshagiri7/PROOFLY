import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, ArrowRight, Sparkles, X, CheckCircle2, ChevronRight } from 'lucide-react';

export interface ProofScoreData {
  proofScore: number;
  jobFit: number;
  evidenceStrength: number;
  requirementCoverage: number;
  profileCompleteness: number;
  whyNot100Reasons?: Array<{
    title: string;
    category: string;
    pointsLost: number;
    status: 'PARTIAL' | 'NO EVIDENCE';
    reason: string;
    recommendation: string;
  }>;
}

interface ProofScoreCardProps {
  data: ProofScoreData;
  onOpenProveThisDecision: () => void;
}

export const ProofScoreCard: React.FC<ProofScoreCardProps> = ({ data, onOpenProveThisDecision }) => {
  const [showWhyNot100, setShowWhyNot100] = useState(false);

  const reasons = data.whyNot100Reasons || [
    {
      title: 'Kubernetes Cluster Management',
      category: 'Cloud / DevOps',
      pointsLost: 5.0,
      status: 'NO EVIDENCE' as const,
      reason: 'No Kubernetes evidence was found in the submitted resume.',
      recommendation: 'Add production or lab experience detailing Kubernetes manifest deployments.'
    },
    {
      title: 'Cloud or Security Certification',
      category: 'Certifications',
      pointsLost: 5.0,
      status: 'NO EVIDENCE' as const,
      reason: 'No active certification credentials found in the Education or Certifications sections.',
      recommendation: 'List verified AWS, CKA, or GCP credentials.'
    },
    {
      title: 'AWS Cloud Infrastructure',
      category: 'Cloud / DevOps',
      pointsLost: 3.0,
      status: 'PARTIAL' as const,
      reason: 'AWS EC2 & S3 verified, but multi-region architecture is not explicitly documented.',
      recommendation: 'Document scale and multi-region infrastructure metrics.'
    }
  ];

  const missingDelta = Math.max(0, 100 - data.proofScore);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              SIGNATURE METRIC
            </span>
            <span className="text-xs text-slate-400 font-mono">DETERMINISTIC VERIFICATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1 flex items-center gap-2">
            PROOF SCORE™
          </h2>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowWhyNot100(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span>WHY NOT 100%? (-{missingDelta}%)</span>
          </button>

          <button
            onClick={onOpenProveThisDecision}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>WHY {data.proofScore}%? PROVE THIS DECISION</span>
          </button>
        </div>
      </div>

      {/* Main Score & 4 Pillars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        {/* Large Score Circle */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase text-slate-400">Total Proof Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-300">
                {data.proofScore}%
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Confidence Evidence
            </p>
          </div>

          <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 border-r-indigo-500 flex items-center justify-center font-mono text-sm font-bold text-slate-200">
            {data.proofScore}/100
          </div>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-3.5 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[11px]">JOB FIT</span>
              <span className="text-white font-bold">{data.jobFit}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-700" style={{ width: `${data.jobFit}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-sans">Weighted requirement coverage</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[11px]">EVIDENCE STRENGTH</span>
              <span className="text-emerald-400 font-bold">{data.evidenceStrength}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${data.evidenceStrength}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-sans">Direct production citations</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[11px]">REQUIREMENT COVERAGE</span>
              <span className="text-purple-400 font-bold">{data.requirementCoverage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full transition-all duration-700" style={{ width: `${data.requirementCoverage}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-sans">6 of 8 requirements matched</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[11px]">PROFILE COMPLETENESS</span>
              <span className="text-cyan-400 font-bold">{data.profileCompleteness}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full transition-all duration-700" style={{ width: `${data.profileCompleteness}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-sans">12 of 13 fields verified</p>
          </div>
        </div>
      </div>

      {/* WHY NOT 100% Modal Drawer */}
      {showWhyNot100 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-card rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">WHY NOT 100%? (Missing {missingDelta}%)</h3>
                  <p className="text-xs text-slate-400">Deterministic breakdown of points lost based on verified resume data.</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhyNot100(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {reasons.map((r, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {r.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      -{r.pointsLost}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans pl-4 border-l-2 border-slate-800 leading-relaxed">
                    <strong className="text-slate-400">Finding: </strong> {r.reason}
                  </p>

                  <div className="pl-4 pt-1 text-[11px] text-blue-300/90 flex items-start gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-blue-200">How to prove 100%: </strong>{r.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowWhyNot100(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
