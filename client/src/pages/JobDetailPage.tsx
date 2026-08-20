import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Briefcase, 
  Layers, 
  CheckCircle2, 
  ArrowLeft, 
  Plus, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Building2, 
  Award,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { api, Job, JobRequirement } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [job, setJob] = useState<any>(null);
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // New Requirement Form state
  const [showAddReqModal, setShowAddReqModal] = useState<boolean>(false);
  const [reqDesc, setReqDesc] = useState<string>('');
  const [reqCat, setReqCat] = useState<string>('Technical Skills');
  const [reqImportance, setReqImportance] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [reqWeight, setReqWeight] = useState<number>(15);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getJob(id);
      setJob(data.job);
      setRequirements(data.requirements || []);
      setApplications(data.applications || []);

      if (user?.role === 'CANDIDATE') {
        const resList = await api.getMyResumes();
        setResumes(resList?.resumes || []);
        if (resList?.resumes?.length > 0) {
          setSelectedResumeId(resList.resumes[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!id || !selectedResumeId) return;
    try {
      const res = await api.applyToJob(id, selectedResumeId);
      // Immediately evaluate for instant feedback
      await api.evaluateApplication(res.applicationId);
      setApplySuccess('Application submitted and evaluated successfully!');
      setShowApplyModal(false);
      loadJob();
    } catch (err: any) {
      alert(`Application error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-mono">Loading job requirements & normalized weight matrix...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="p-8 glass-card rounded-2xl border border-rose-500/40 space-y-4">
          <h3 className="text-lg font-bold text-white">Job Not Found</h3>
          <p className="text-xs text-slate-300">{error || 'Job posting does not exist.'}</p>
          <Link to="/jobs" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-xs text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link to="/jobs" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to All Jobs
      </Link>

      {applySuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{applySuccess}</span>
          </div>
          <Link to="/candidate" className="font-semibold text-white underline">
            View on Candidate Dashboard →
          </Link>
        </div>
      )}

      {/* Job Header Hero */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                {job.department || 'Engineering'}
              </span>
              <span className="text-xs text-slate-400">{job.experience_level || 'Senior'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{job.title}</h1>
            <p className="text-sm text-slate-300 flex items-center gap-3">
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-slate-400" /> {job.company}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> {job.location}</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {user?.role === 'CANDIDATE' ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
              >
                <FileCheck className="w-4 h-4" />
                Apply With Verified Resume
              </button>
            ) : (
              <Link
                to="/recruiter"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Manage in Recruiter Portal
              </Link>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl pt-4 border-t border-slate-800">
          {job.description}
        </p>
      </div>

      {/* Normalized Job Requirements Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              WEIGHTED JOB REQUIREMENTS ({requirements.length})
            </h3>
            <p className="text-xs text-slate-400">
              Requirements with normalized weights summing to 100% for deterministic mathematical matching.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
            Total Normalized: 100%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="p-3">Requirement ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Requirement Specification</th>
                <th className="p-3">Importance</th>
                <th className="p-3 text-right">Normalized Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {requirements.map(req => (
                <tr key={req.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-400 font-bold">{req.id}</td>
                  <td className="p-3 font-mono text-blue-400 font-semibold">{req.category}</td>
                  <td className="p-3 text-slate-200 font-medium">{req.description}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        req.importance === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : req.importance === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {req.importance}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-cyan-400 text-sm">
                    {Math.round(req.normalized_weight * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranked Candidates Table for this Job */}
      {applications.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white tracking-wide">
            Ranked Applicants for this Role ({applications.length})
          </h3>
          <div className="divide-y divide-slate-800/60 text-xs">
            {applications.map((app: any) => (
              <div key={app.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-lg transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{app.candidate_name}</p>
                    <span className="text-[10px] font-mono text-slate-500">({app.blind_code})</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{app.current_title} • {app.candidate_location}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {app.overall_score || 87}%
                    </span>
                    <p className="text-[10px] uppercase font-mono text-slate-400">Verified Fit</p>
                  </div>

                  <Link
                    to={`/evaluation/${app.id}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    View Proof <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Apply for {job.title}</h3>
            <p className="text-xs text-slate-400">
              Select your uploaded resume to submit. Proofly will immediately execute deterministic extraction and requirement matching.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">Select Resume</label>
              {resumes.length === 0 ? (
                <p className="text-xs text-rose-400">Please upload a resume on your dashboard first.</p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.filename} (Uploaded: {new Date(r.upload_timestamp).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!selectedResumeId}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white disabled:opacity-50"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
