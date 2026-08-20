import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';

export interface RecruiterPoolInsights {
  mostCommonMissingSkill: {
    skill: string;
    missingPercentage: number;
    impact: string;
  };
  mostCompetitiveSkill: {
    skill: string;
    presencePercentage: number;
    quality: string;
  };
  evidenceWeakness: {
    category: string;
    reason: string;
  };
  candidatePoolStrength: {
    score: number;
    summary: string;
  };
}

interface RecruiterInsightEngineProps {
  insights?: RecruiterPoolInsights;
}

export const RecruiterInsightEngine: React.FC<RecruiterInsightEngineProps> = ({ insights }) => {
  const defaultInsights: RecruiterPoolInsights = {
    mostCommonMissingSkill: {
      skill: 'Kubernetes & Container Orchestration',
      missingPercentage: 67,
      impact: 'Candidates have Docker foundation but lack production EKS/GKE cluster operation evidence.'
    },
    mostCompetitiveSkill: {
      skill: 'Python & PostgreSQL Optimization',
      presencePercentage: 100,
      quality: '100% of candidate pool demonstrates verified high-throughput database tuning experience.'
    },
    evidenceWeakness: {
      category: 'Cloud Certifications',
      reason: 'Formal AWS Solutions Architect or CKA certifications are absent across 80% of submitted resumes.'
    },
    candidatePoolStrength: {
      score: 87,
      summary: 'Exceptionally strong backend fundamentals and asynchronous API architecture across candidates.'
    }
  };

  const pool = insights || defaultInsights;

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">RECRUITER INSIGHT ENGINE™</h3>
            <p className="text-xs text-slate-400">
              What the candidate pool is telling you • AI-assisted aggregate intelligence.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">Aggregated across all applicants</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Common Missing Skill */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Most Common Missing Skill
            </span>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {pool.mostCommonMissingSkill.missingPercentage}% Missing
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">{pool.mostCommonMissingSkill.skill}</h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{pool.mostCommonMissingSkill.impact}</p>
        </div>

        {/* Most Competitive Skill */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Most Competitive Skill
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {pool.mostCompetitiveSkill.presencePercentage}% Present
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">{pool.mostCompetitiveSkill.skill}</h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{pool.mostCompetitiveSkill.quality}</p>
        </div>

        {/* Evidence Weakness */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Pool Evidence Gap
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {pool.evidenceWeakness.category}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{pool.evidenceWeakness.reason}</p>
        </div>

        {/* Candidate Pool Strength */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" /> Pool Quality Index
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {pool.candidatePoolStrength.score}/100 Strong
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{pool.candidatePoolStrength.summary}</p>
        </div>
      </div>
    </div>
  );
};
