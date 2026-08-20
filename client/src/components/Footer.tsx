import React from 'react';
import { ShieldCheck, Cpu, Database, CheckCircle2, GitBranch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060911] text-slate-400 text-xs py-12 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="font-bold text-sm tracking-wider text-white">PROOFLY</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Evidence-First Recruitment Intelligence platform. Transforming black-box AI scores into transparent, explainable hiring decisions.
            </p>
            <p className="text-[11px] text-blue-400 font-mono">
              “Don’t just rank candidates. Prove why.”
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Core Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> PDF/DOCX Shared Extractor</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> 13+ Deterministic Fields</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Exact Character Offset Evidence</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Normalized JD Requirement Weights</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Key Differentiators</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/lab" className="hover:text-blue-400 transition-colors">Parser Reliability Lab</Link></li>
              <li><span className="text-slate-400">Interactive Evidence Trace Chain</span></li>
              <li><span className="text-slate-400">Job Gap Weight Simulator</span></li>
              <li><span className="text-slate-400">Blind Screening PII Redaction</span></li>
              <li><span className="text-slate-400">Resume Evolution Diff (V1/V2/V3)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Proofly Pipeline</h4>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono text-[10px] space-y-1 text-slate-300">
              <div className="text-blue-400">FACT & RESUME</div>
              <div>↓ EXTRACT & SEGMENT</div>
              <div>↓ DETERMINISTIC PARSER</div>
              <div>↓ EVIDENCE ENGINE</div>
              <div>↓ AI MATCHING</div>
              <div className="text-emerald-400">✓ HUMAN DECISION</div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 PROOFLY. Evidence-First Recruitment Intelligence.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Deterministic Parsing</span>
            <span>•</span>
            <span>Zero-Drift Execution</span>
            <span>•</span>
            <span>Traceable Citations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
