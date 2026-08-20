import React, { useState } from 'react';
import { Flame, FileText, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export interface SectionDensity {
  section: string;
  density: number; // 0 to 100
  evidenceCount: number;
  snippet: string;
}

interface ProofHeatmapProps {
  heatmapData?: SectionDensity[];
}

export const ProofHeatmap: React.FC<ProofHeatmapProps> = ({ heatmapData }) => {
  const defaultData: SectionDensity[] = [
    { section: 'Contact', density: 100, evidenceCount: 4, snippet: 'alex.rivera@example.com | +1 (555) 234-5678 | San Francisco, CA' },
    { section: 'Summary', density: 85, evidenceCount: 2, snippet: 'Senior Backend Engineer with 5+ years of experience designing high-throughput microservices...' },
    { section: 'Skills', density: 100, evidenceCount: 12, snippet: 'Python, FastAPI, Django, SQL, PostgreSQL, Docker, Redis, REST APIs, TypeScript, React' },
    { section: 'Experience', density: 95, evidenceCount: 8, snippet: 'Senior Software Engineer @ Apex Cloud Systems (FastAPI, 15M req/day, PostgreSQL 42ms p99 latency)' },
    { section: 'Projects', density: 90, evidenceCount: 3, snippet: 'OpenSync Distributed Event Bus (Python, Redis, Docker deployment recipes)' },
    { section: 'Education', density: 100, evidenceCount: 2, snippet: 'University of California, Berkeley - B.S. Computer Science | 2019' },
    { section: 'Certifications', density: 0, evidenceCount: 0, snippet: 'No certification evidence found in submitted resume.' }
  ];

  const data = heatmapData && heatmapData.length > 0 ? heatmapData : defaultData;
  const [selectedSection, setSelectedSection] = useState<SectionDensity>(data[3]); // Default Experience

  const getHeatmapColor = (density: number) => {
    if (density >= 90) return 'bg-emerald-500 text-emerald-950 border-emerald-400';
    if (density >= 70) return 'bg-teal-500 text-teal-950 border-teal-400';
    if (density >= 40) return 'bg-amber-500 text-amber-950 border-amber-400';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const getBarGradient = (density: number) => {
    if (density >= 90) return 'bg-gradient-to-r from-emerald-600 to-teal-400';
    if (density >= 70) return 'bg-gradient-to-r from-teal-600 to-cyan-400';
    if (density >= 40) return 'bg-gradient-to-r from-amber-600 to-yellow-400';
    return 'bg-slate-800';
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              EVIDENCE DENSITY
            </span>
            <h3 className="text-xl font-black text-white">PROOF HEATMAP™</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section-by-section evidence distribution map for verified job requirements.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400">Click a section block to inspect citation density</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Grid Bars */}
        <div className="lg:col-span-7 space-y-3">
          {data.map((item) => {
            const isSelected = selectedSection.section === item.section;
            return (
              <div
                key={item.section}
                onClick={() => setSelectedSection(item)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/50 ring-2 ring-emerald-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <span className="font-bold text-white uppercase font-mono tracking-wider">
                    {item.section}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 text-[11px]">{item.evidenceCount} Citations</span>
                    <span className="font-bold text-white">{item.density}% Density</span>
                  </div>
                </div>

                {/* Density Bar */}
                <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getBarGradient(item.density)}`}
                    style={{ width: `${item.density}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Section Evidence Preview */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800 space-y-4 bg-slate-900/90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Section Evidence Detail
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {selectedSection.density}% Coverage
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-mono text-slate-400">Target Section</p>
              <h4 className="text-base font-bold text-white uppercase font-mono">{selectedSection.section}</h4>
            </div>

            <div>
              <p className="text-[11px] font-mono text-slate-400">Verified Evidence Items</p>
              <p className="text-xs font-mono text-emerald-300 font-bold">{selectedSection.evidenceCount} verified entries</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <p className="text-[10px] font-mono text-slate-400 uppercase">Verbatim Extract Snippet</p>
              <p className="text-xs text-slate-200 font-mono italic leading-relaxed">
                "{selectedSection.snippet}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
