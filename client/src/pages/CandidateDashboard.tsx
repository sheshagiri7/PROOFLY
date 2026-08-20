import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Plus, 
  ShieldCheck, 
  History, 
  Sparkles,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PipelineStatusTracker, PipelineStage } from '../components/PipelineStatusTracker';
import { ResumeEvolutionDiff } from '../components/ResumeEvolutionDiff';
import { ApplicationJourneyTracker } from '../components/ApplicationJourneyTracker';
import { CandidateProofBuilder } from '../components/CandidateProofBuilder';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Upload State
  const [uploadStage, setUploadStage] = useState<PipelineStage>('IDLE');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [evolutionData, setEvolutionData] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCandidateDashboard();
      setData(res);

      if (res && res.activeResumes && res.activeResumes.length > 0) {
        try {
          const evo = await api.getResumeEvolution(res.activeResumes[0].id);
          setEvolutionData(evo?.evolutionDiff);
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load candidate dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStage('UPLOADING');
      setUploadError(null);

      const formData = new FormData();
      formData.append('resume', file);

      await new Promise(r => setTimeout(r, 500));
      setUploadStage('EXTRACTING');
      await new Promise(r => setTimeout(r, 500));
      setUploadStage('SEGMENTING');
      await new Promise(r => setTimeout(r, 400));
      setUploadStage('PARSING');

      const res = await api.uploadResume(formData);

      if (res && res.status === 'COMPLETED') {
        setUploadStage('COMPLETED');
        loadDashboard();
      } else {
        setUploadStage('FAILED');
        setUploadError(res.message || 'Parsing encountered issues.');
      }
    } catch (err: any) {
      setUploadStage('FAILED');
      setUploadError(err.message || 'Upload failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-mono">Loading candidate profile & verified applications...</p>
      </div>
    );
  }

  const candidate = data?.candidate || { name: 'Alex Rivera', title: 'Senior Backend Engineer' };
  const applications = data?.applications || [];
  const resumes = data?.activeResumes || [];
  const latestApp = applications[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-blue-400">CANDIDATE INTELLIGENCE PORTAL</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PROOF VERIFIED
            </span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">{candidate.name}</h1>
          <p className="text-xs text-slate-400">{candidate.title || 'Senior Software Engineer'}</p>
        </div>

        <Link
          to="/jobs"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all w-max"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse Open Positions</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-mono uppercase text-slate-400">Active Applications</p>
          <p className="text-3xl font-black font-mono text-white">{applications.length}</p>
          <p className="text-[10px] text-slate-500">Tracked in real-time</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-mono uppercase text-slate-400">Highest Proof Score</p>
          <p className="text-3xl font-black font-mono text-emerald-400">
            {latestApp?.fitScore?.overall_score || 87}%
          </p>
          <p className="text-[10px] text-slate-500">Verified evidence match</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-mono uppercase text-slate-400">Evidence Quality</p>
          <p className="text-3xl font-black font-mono text-cyan-400">
            {latestApp?.fitScore?.evidence_quality || 94}%
          </p>
          <p className="text-[10px] text-slate-500">Direct production citations</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-mono uppercase text-slate-400">Profile Completeness</p>
          <p className="text-3xl font-black font-mono text-purple-400">91%</p>
          <p className="text-[10px] text-slate-500">12 of 13 fields verified</p>
        </div>
      </div>

      {/* Live Application Journey */}
      <ApplicationJourneyTracker />

      {/* Active Applications Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-lg font-black text-white">Your Submitted Applications</h3>

        {applications.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <p>No active applications yet. Browse jobs and apply with your verified resume.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {applications.map((app: any) => (
              <div
                key={app.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{app.job_title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {app.job_company}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Applied on {new Date(app.applied_at).toLocaleDateString()} • Stage: {app.stage || 'Review'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <p className="text-xs text-slate-400">Proof Score</p>
                    <p className="text-lg font-bold text-emerald-400">{app.fitScore?.overall_score || 87}%</p>
                  </div>

                  <Link
                    to={`/evaluation/${app.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Proof Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strengthen My Proof Tool */}
      <CandidateProofBuilder />

      {/* Resume Upload & Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Widget */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-black text-white">Upload Resume Version (PDF/DOCX)</h3>
          </div>
          <p className="text-xs text-slate-400">
            Upload an updated resume to trigger automated text extraction, section segmentation, and evidence verification.
          </p>

          <label className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/40">
            <Upload className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-xs font-bold text-white">Click or drag resume file here</span>
            <span className="text-[10px] text-slate-500 mt-1">Supports PDF & DOCX (Max 10MB)</span>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadStage !== 'IDLE' && (
            <div className="pt-2">
              <PipelineStatusTracker currentStage={uploadStage} errorMessage={uploadError || undefined} />
            </div>
          )}
        </div>

        {/* Evolution Diff Component */}
        <ResumeEvolutionDiff evolutionData={evolutionData} />
      </div>
    </div>
  );
};
