import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Cpu, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sliders, 
  EyeOff, 
  FlaskConical, 
  History, 
  Users, 
  Quote,
  Check,
  Play,
  HelpCircle,
  Dna,
  Calendar,
  Flame,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { ProveThisDecisionModal } from '../components/ProveThisDecisionModal';
import { PipelineStatusTracker, PipelineStage } from '../components/PipelineStatusTracker';
import { ProofScoreCard } from '../components/ProofScoreCard';
import { api, FullApplicationReport } from '../services/api';

export const LandingPage: React.FC = () => {
  const { user, switchPersona } = useAuth();
  const navigate = useNavigate();

  // Demo Pipeline State
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('IDLE');
  const [demoReport, setDemoReport] = useState<FullApplicationReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [demoActive, setDemoActive] = useState<boolean>(false);

  const runLiveDemo = async () => {
    try {
      setDemoActive(true);
      setPipelineStage('UPLOADING');
      await new Promise(r => setTimeout(r, 600));

      setPipelineStage('EXTRACTING');
      await new Promise(r => setTimeout(r, 600));

      setPipelineStage('SEGMENTING');
      await new Promise(r => setTimeout(r, 500));

      setPipelineStage('PARSING');
      await new Promise(r => setTimeout(r, 600));

      setPipelineStage('VERIFYING');
      await new Promise(r => setTimeout(r, 600));

      setPipelineStage('SCORING');
      await new Promise(r => setTimeout(r, 700));

      // Fetch actual application report from backend
      const report = await api.getApplication('app-1', false);
      setDemoReport(report);
      setPipelineStage('COMPLETED');

      // Trigger confetti celebration on 87% match
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Demo error:', err);
      setPipelineStage('FAILED');
    }
  };

  const sampleScoreData = {
    proofScore: 87,
    jobFit: 87,
    evidenceStrength: 94,
    requirementCoverage: 82,
    profileCompleteness: 91,
    whyNot100Reasons: [
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
    ]
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 text-center max-w-5xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-6 animate-pulse">
          <ShieldCheck className="w-4 h-4" />
          <span>EVIDENCE-FIRST RECRUITMENT INTELLIGENCE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
          Don’t just rank candidates. <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Prove why.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Traditional AI says <span className="font-mono text-slate-400 font-semibold">“Candidate Match: 87%”</span>. Proofly says <span className="font-mono text-emerald-400 font-semibold">“87% — and here is the exact verbatim evidence proving why.”</span>
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={runLiveDemo}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm flex items-center gap-2.5 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RUN LIVE DEMO EVALUATION</span>
          </button>

          <Link
            to="/evaluation/app-1"
            className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm flex items-center gap-2 transition-all"
          >
            <span>Explore Flagship Evaluation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Hero 6-Stage Visual Chain */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-500">STAGE 1</span>
            <p className="text-xs font-bold text-slate-200">Raw Resume</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-500">STAGE 2</span>
            <p className="text-xs font-bold text-slate-200">Text & Offsets</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-500">STAGE 3</span>
            <p className="text-xs font-bold text-slate-200">13 Core Fields</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-500">STAGE 4</span>
            <p className="text-xs font-bold text-slate-200">Evidence Citations</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-500">STAGE 5</span>
            <p className="text-xs font-bold text-emerald-400">PROOF SCORE™</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-500">STAGE 6</span>
            <p className="text-xs font-bold text-blue-400">Human Decision</p>
          </div>
        </div>
      </section>

      {/* Live Interactive Evaluation Showcase */}
      {demoActive && (
        <section className="max-w-5xl mx-auto px-4 space-y-6 animate-fadeIn">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase text-blue-400">DEMO EXECUTION PIPELINE</span>
                <h3 className="text-xl font-black text-white">Live Candidate: Alex Rivera (Senior Backend Engineer)</h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                Target: Senior Full-Stack Engineer
              </span>
            </div>

            <PipelineStatusTracker currentStage={pipelineStage} />

            {pipelineStage === 'COMPLETED' && (
              <div className="space-y-6 pt-4 border-t border-slate-800 animate-fadeIn">
                <ProofScoreCard
                  data={sampleScoreData}
                  onOpenProveThisDecision={() => setIsModalOpen(true)}
                />

                <div className="flex justify-end gap-3">
                  <Link
                    to="/evaluation/app-1"
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <span>Open Full Evaluation Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Comparison: Traditional Black-Box ATS vs PROOFLY */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-wide">
            THE PARADIGM SHIFT
          </h2>
          <p className="text-sm text-slate-400">
            Why probabilistic black-box ranking fails, and how deterministic evidence solves compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Black Box Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-rose-900/30 bg-gradient-to-b from-rose-950/10 to-slate-950/50 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Traditional AI Recruitment</h3>
                <p className="text-xs text-rose-300/80">Black-Box Guessing</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Opaque <strong>“87% Match”</strong> with zero traceable evidence citations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Hallucinates skills or claims <em>“Candidate does not know X”</em>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Scores drift wildly between runs on the same exact resume.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Recruiter cannot explain or defend hiring decisions during audits.</span>
              </li>
            </ul>
          </div>

          {/* Proofly Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/10 to-slate-950/50 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">PROOFLY Proof Engine</h3>
                <p className="text-xs text-emerald-300/80">Evidence-Backed Truth</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Every score links to exact <strong>verbatim resume text and source section</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Compliant wording: <em>“No evidence found in submitted resume.”</em></span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Zero-drift deterministic scoring</strong> with 100% reproducibility.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>“WHY NOT 100%?”</strong> breakdown and interactive <strong>Job Gap Simulator</strong>.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Signature Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-wide">
            ENTERPRISE RECRUITMENT INTELLIGENCE
          </h2>
          <p className="text-sm text-slate-400">
            Differentiating capabilities built for modern talent teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Quote className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-white">PROVE THIS DECISION</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any match score to trigger a 4-stage visual trace from Score → Requirement → Field → Verbatim Citation.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-white">JOB GAP SIMULATOR</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically adjust JD requirement weights with live recalculation to discover what changes the hiring outcome.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">BLIND SCREENING MODE</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One-click anonymization masking candidate name, email, phone, and location to eliminate hiring bias.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Dna className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-white">REQUIREMENT DNA™</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comparative matrix contrasting Target Job DNA against Proven Candidate DNA across 6 core competency domains.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white">PROOF TIMELINE™</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chronological evidence milestone trace linking education, experience, and open source projects to verified citations.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white">ASK PROOFLY™</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Context-grounded recruiter Q&A assistant answering questions strictly from verified resume citations with zero hallucination.
            </p>
          </div>
        </div>
      </section>

      {/* Prove This Decision Modal */}
      <ProveThisDecisionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={demoReport}
      />
    </div>
  );
};
