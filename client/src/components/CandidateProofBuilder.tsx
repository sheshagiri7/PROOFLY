import React, { useState } from 'react';
import { Sparkles, ShieldAlert, ArrowRight, CheckCircle2, FileEdit, Plus, HelpCircle } from 'lucide-react';

export const CandidateProofBuilder: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState<string>('AWS');
  const [candidateNotes, setCandidateNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const skillsToStrengthen = [
    {
      skill: 'AWS',
      currentEvidence: 'Partial / Project-level (EC2, S3)',
      strengthStatus: 'LIMITED',
      recommendation: 'Add production architectural metrics (e.g. Terraform configs, IAM roles, or high-throughput S3 pipelines).',
      promptExample: 'e.g., "Architected multi-region AWS S3 data pipelines processing 2TB daily assets with IAM role segregation."'
    },
    {
      skill: 'Kubernetes',
      currentEvidence: 'No evidence found in submitted resume',
      strengthStatus: 'NO_EVIDENCE',
      recommendation: 'Add experience or lab projects demonstrating Kubernetes pod lifecycle management, Ingress controllers, or Helm charts.',
      promptExample: 'e.g., "Deployed and maintained 12 microservices using Kubernetes Helm charts with automated rollback triggers."'
    },
    {
      skill: 'Cloud Certifications',
      currentEvidence: 'No credentials found in Education/Certifications',
      strengthStatus: 'NO_EVIDENCE',
      recommendation: 'List active AWS Certified Solutions Architect, CKA, or GCP Cloud Engineer credential IDs.',
      promptExample: 'e.g., "AWS Certified Solutions Architect - Associate (Validation #AWS-8921-2024)"'
    }
  ];

  const activeItem = skillsToStrengthen.find(s => s.skill === selectedSkill) || skillsToStrengthen[0];

  const handleSaveProofSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              CANDIDATE INTELLIGENCE
            </span>
            <h3 className="text-xl font-black text-white">STRENGTHEN MY PROOF™</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded suggestions to convert missing or partial skills into verified evidence.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400">Zero Hallucination Proof Builder</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Skill Selector List */}
        <div className="lg:col-span-4 space-y-2.5">
          <p className="text-xs font-mono uppercase text-slate-400">Select Competency to Boost:</p>
          {skillsToStrengthen.map((item) => (
            <button
              key={item.skill}
              onClick={() => {
                setSelectedSkill(item.skill);
                setSavedSuccess(false);
              }}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                selectedSkill === item.skill
                  ? 'bg-slate-900 border-blue-500/50 shadow-md shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{item.skill}</span>
                <span
                  className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                    item.strengthStatus === 'LIMITED'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {item.strengthStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{item.currentEvidence}</p>
            </button>
          ))}
        </div>

        {/* Guidance and Evidence Drafter */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-slate-800 space-y-5 bg-slate-900/90">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Proof Recommendation for {activeItem.skill}
              </h4>
              <span className="text-xs font-mono text-emerald-400">+5.0% Fit Potential</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-950 border border-slate-800">
              {activeItem.recommendation}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-mono text-slate-400 uppercase">Suggested Verifiable Phrasing Example:</p>
            <p className="text-xs font-mono text-blue-300 italic p-3 rounded-xl bg-blue-950/20 border border-blue-500/20">
              {activeItem.promptExample}
            </p>
          </div>

          <form onSubmit={handleSaveProofSnippet} className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <FileEdit className="w-3.5 h-3.5 text-slate-400" />
              Draft your verified accomplishment snippet for Resume V3:
            </label>
            <textarea
              rows={3}
              value={candidateNotes}
              onChange={(e) => setCandidateNotes(e.target.value)}
              placeholder="Paste or write your hands-on experience or project bullet point here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                PROOFLY will index this in your next resume evolution upload.
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all"
              >
                Save Evidence Draft
              </button>
            </div>
          </form>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Evidence draft saved successfully! Re-run parser on V3 resume when ready.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
