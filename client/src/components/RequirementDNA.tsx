import React from 'react';
import { Dna, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export interface RequirementDnaCategory {
  name: string;
  jobDna: number; // JD weight %
  candidateDna: number; // Candidate fulfillment %
}

interface RequirementDNAProps {
  categories?: RequirementDnaCategory[];
}

export const RequirementDNA: React.FC<RequirementDNAProps> = ({ categories }) => {
  const defaultCategories: RequirementDnaCategory[] = [
    { name: 'Technical Skills (Python, SQL, Docker)', jobDna: 45, candidateDna: 45 },
    { name: 'Databases & Query Optimization', jobDna: 20, candidateDna: 20 },
    { name: 'Cloud & Infrastructure (AWS, K8s)', jobDna: 20, candidateDna: 12 },
    { name: 'Frontend Architecture (React, TS)', jobDna: 10, candidateDna: 9 },
    { name: 'Education & Computer Science Degree', jobDna: 5, candidateDna: 5 },
    { name: 'Cloud / Security Certifications', jobDna: 5, candidateDna: 0 }
  ];

  const cats = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              INTELLIGENCE MATRIX
            </span>
            <h3 className="text-xl font-black text-white">REQUIREMENT DNA™</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparative analysis of Job Description DNA vs Candidate Evidence DNA.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" /> Target Job DNA
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Candidate Proven DNA
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {cats.map((cat, idx) => {
          const matchPercent = Math.round((cat.candidateDna / Math.max(1, cat.jobDna)) * 100);
          const isFull = matchPercent >= 90;
          const isPartial = matchPercent >= 40 && matchPercent < 90;

          return (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Dna className="w-4 h-4 text-cyan-400" />
                  {cat.name}
                </span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400 text-[11px]">JD: {cat.jobDna}%</span>
                  <span className="text-cyan-400 font-bold">Candidate: {cat.candidateDna}%</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isFull
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : isPartial
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {matchPercent}% DNA Match
                  </span>
                </div>
              </div>

              {/* Comparative Dual Bars */}
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex">
                  {/* Job Target Bar */}
                  <div
                    className="bg-slate-700 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.jobDna * 2}%` }}
                  />
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex">
                  {/* Candidate Match Bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFull ? 'bg-cyan-500' : isPartial ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${cat.candidateDna * 2}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
