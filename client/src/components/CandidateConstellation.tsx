import React, { useState } from 'react';
import { Sparkles, User, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ConstellationCandidate {
  id: string;
  applicationId: string;
  name: string;
  role: string;
  proofScore: number;
  evidenceStrength: number;
  status: 'Strong Match' | 'Needs Review' | 'Low Evidence';
  x: number; // percentage in coordinate grid
  y: number; // percentage in coordinate grid
}

interface CandidateConstellationProps {
  candidates?: ConstellationCandidate[];
  blindMode?: boolean;
}

export const CandidateConstellation: React.FC<CandidateConstellationProps> = ({
  candidates,
  blindMode = false
}) => {
  const defaultCandidates: ConstellationCandidate[] = [
    {
      id: 'cand-1',
      applicationId: 'app-1',
      name: 'Alex Rivera',
      role: 'Senior Backend Engineer',
      proofScore: 87,
      evidenceStrength: 94,
      status: 'Strong Match',
      x: 35,
      y: 40
    },
    {
      id: 'cand-2',
      applicationId: 'app-2',
      name: 'Marcus Vance',
      role: 'Full Stack Developer',
      proofScore: 82,
      evidenceStrength: 88,
      status: 'Strong Match',
      x: 65,
      y: 35
    },
    {
      id: 'cand-3',
      applicationId: 'app-3',
      name: 'Sophia Lin',
      role: 'DevOps & Backend Engineer',
      proofScore: 78,
      evidenceStrength: 84,
      status: 'Needs Review',
      x: 50,
      y: 70
    }
  ];

  const pool = candidates && candidates.length > 0 ? candidates : defaultCandidates;
  const [selectedCandidate, setSelectedCandidate] = useState<ConstellationCandidate>(pool[0]);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              PREMIUM VISUALIZATION
            </span>
            <h3 className="text-xl font-black text-white">CANDIDATE CONSTELLATION™</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual topology where node radius maps to Proof Score and orbital ring to Evidence Strength.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Strong Match (&gt;80%)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Needs Review
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Visual Map Canvas */}
        <div className="lg:col-span-8 relative h-72 sm:h-80 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden flex items-center justify-center">
          {/* Subtle celestial grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

          {/* Render Candidate Nodes */}
          {pool.map((c) => {
            const isSelected = selectedCandidate.id === c.id;
            const displayName = blindMode ? `Candidate (${c.id.toUpperCase()})` : c.name;
            const size = c.proofScore >= 85 ? 56 : 48;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCandidate(c)}
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
              >
                {/* Orbital Ring (Evidence Strength) */}
                <div
                  className={`rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'ring-4 ring-blue-500/40 shadow-xl shadow-blue-500/30'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background:
                      c.proofScore >= 80
                        ? 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(15,23,42,0.9) 100%)'
                        : 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, rgba(15,23,42,0.9) 100%)',
                    border: `2px solid ${c.proofScore >= 80 ? '#10B981' : '#F59E0B'}`
                  }}
                >
                  <span className="text-xs font-mono font-bold text-white">{c.proofScore}%</span>
                </div>

                <span className="mt-1 text-[11px] font-bold text-slate-200 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 whitespace-nowrap shadow-sm group-hover:text-blue-300 transition-colors">
                  {displayName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Candidate Quick Inspector */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-slate-800 space-y-4 bg-slate-900/90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400">Node Inspector</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
              {selectedCandidate.status}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Selected Candidate</p>
              <h4 className="text-base font-bold text-white">
                {blindMode ? `Candidate (${selectedCandidate.id.toUpperCase()})` : selectedCandidate.name}
              </h4>
              <p className="text-xs text-slate-400">{selectedCandidate.role}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-400">Proof Score</p>
                <p className="text-lg font-bold text-emerald-400">{selectedCandidate.proofScore}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-400">Evidence</p>
                <p className="text-lg font-bold text-cyan-400">{selectedCandidate.evidenceStrength}%</p>
              </div>
            </div>

            <Link
              to={`/evaluation/${selectedCandidate.applicationId}`}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all block text-center"
            >
              <span>Open Evidence Evaluation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
