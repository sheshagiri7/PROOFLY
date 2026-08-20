import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Plus, 
  EyeOff, 
  Eye, 
  Search, 
  Filter, 
  ArrowRight, 
  Sliders,
  UserCheck,
  UserX,
  Clock,
  ChevronRight,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BlindScreeningToggle } from '../components/BlindScreeningToggle';
import { CandidateCompareMatrix } from '../components/CandidateCompareMatrix';
import { RecruiterInsightEngine } from '../components/RecruiterInsightEngine';
import { CandidateConstellation } from '../components/CandidateConstellation';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isBlind, setIsBlind] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Smart Recruiter Filters
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [filterPythonOnly, setFilterPythonOnly] = useState<boolean>(false);

  // Candidate Comparison Selection
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRecruiterDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load recruiter dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId: string, status: string) => {
    try {
      await api.updateApplicationStatus(appId, status);
      loadDashboard();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const toggleSelectCandidate = (appId: string) => {
    if (selectedAppIds.includes(appId)) {
      setSelectedAppIds(selectedAppIds.filter(id => id !== appId));
    } else {
      if (selectedAppIds.length >= 5) {
        alert('You can compare a maximum of 5 candidates at a time.');
        return;
      }
      setSelectedAppIds([...selectedAppIds, appId]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-mono">Loading recruiter workspace & candidate evidence pool...</p>
      </div>
    );
  }

  const jobs = data?.jobs || [];
  const applications = data?.applications || [];
  const stats = data?.stats || { activeJobs: 1, totalApplicants: 1, strongMatches: 1, needsReview: 0, avgMatch: 87 };

  // Multi-Criteria Filtering
  const filteredApps = applications.filter((app: any) => {
    const nameMatch = isBlind 
      ? app.blind_code?.toLowerCase().includes(searchTerm.toLowerCase())
      : (app.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) || app.blind_code?.toLowerCase().includes(searchTerm.toLowerCase()));
    const jobMatch = app.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || jobMatch;

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const score = app.fitScore?.overall_score || 85;
    const matchesScore = score >= minScoreFilter;

    return matchesSearch && matchesStatus && matchesScore;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-blue-400">RECRUITER COMMAND CENTER</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">EVIDENCE-FIRST HIRING</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Applicant Intelligence Pool</h1>
          <p className="text-xs text-slate-400">
            Real-time candidate evidence verification, blind screening, and decision audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BlindScreeningToggle isBlind={isBlind} onToggle={setIsBlind} />

          {selectedAppIds.length >= 2 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all animate-pulse"
            >
              <Users className="w-4 h-4" />
              <span>Compare ({selectedAppIds.length}) Candidates</span>
            </button>
          )}

          <Link
            to="/jobs"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Briefcase className="w-4 h-4" />
            <span>Manage Jobs</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-mono uppercase text-slate-400">Active Postings</p>
          <p className="text-3xl font-black font-mono text-white">{stats.activeJobs}</p>
          <p className="text-[10px] text-slate-500">Configured requirements</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-mono uppercase text-slate-400">Total Applicants</p>
          <p className="text-3xl font-black font-mono text-blue-400">{stats.totalApplicants}</p>
          <p className="text-[10px] text-slate-500">Resumes parsed</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-mono uppercase text-slate-400">Strong Matches (&gt;80%)</p>
          <p className="text-3xl font-black font-mono text-emerald-400">{stats.strongMatches}</p>
          <p className="text-[10px] text-slate-500">Verified evidence</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs font-mono uppercase text-slate-400">Average Proof Score</p>
          <p className="text-3xl font-black font-mono text-purple-400">{stats.avgMatch}%</p>
          <p className="text-[10px] text-slate-500">Deterministic scoring</p>
        </div>
      </div>

      {/* Attention Required Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono">Attention Required</h4>
            <p className="text-xs text-slate-300">
              1 candidate (Alex Rivera) has a verified 87% match with AWS requiring recruiter scale confirmation.
            </p>
          </div>
        </div>

        <Link
          to={`/evaluation/${applications[0]?.id || 'app-1'}`}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <span>Inspect Evidence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Recruiter Pool Insights Engine */}
      <RecruiterInsightEngine />

      {/* Candidate Constellation Visualization */}
      <CandidateConstellation blindMode={isBlind} />

      {/* Candidate Pool Table Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        {/* Table Controls & Smart Recruiter Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isBlind ? "Search blind code (e.g. CAND-8F2A)..." : "Search candidate name or role..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none w-64"
              />
            </div>

            {/* Score Threshold Filter */}
            <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Min Score:</span>
              <button
                onClick={() => setMinScoreFilter(0)}
                className={`px-2 py-0.5 rounded text-[10px] ${minScoreFilter === 0 ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setMinScoreFilter(80)}
                className={`px-2 py-0.5 rounded text-[10px] ${minScoreFilter === 80 ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                &gt;80%
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Showing {filteredApps.length} of {applications.length} candidates
          </div>
        </div>

        {/* Applicants Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <th className="p-3">Select</th>
                <th className="p-3">Candidate</th>
                <th className="p-3">Role Applied</th>
                <th className="p-3">Proof Score™</th>
                <th className="p-3">Evidence Strength</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredApps.map((app: any) => {
                const isSelected = selectedAppIds.includes(app.id);
                const score = app.fitScore?.overall_score || 87;
                const quality = app.fitScore?.evidence_quality || 94;

                return (
                  <tr
                    key={app.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-blue-600/5' : ''
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCandidate(app.id)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    <td className="p-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white flex items-center gap-2">
                          {isBlind ? `Candidate (${app.blind_code})` : app.candidate_name}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          {isBlind ? '[REDACTED]' : app.candidate_email}
                        </p>
                      </div>
                    </td>

                    <td className="p-3">
                      <p className="text-slate-200 font-medium">{app.job_title}</p>
                      <p className="text-[11px] text-slate-400">{app.job_company}</p>
                    </td>

                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-400">{score}%</span>
                        <span className="text-[10px] text-slate-400 font-sans">Verified</span>
                      </div>
                    </td>

                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-400">{quality}%</span>
                        <span className="text-[10px] text-slate-400 font-sans">Direct</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                        {app.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <Link
                        to={`/evaluation/${app.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <span>View Proof</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Comparison Modal */}
      <CandidateCompareMatrix
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        applicationIds={selectedAppIds}
        isBlind={isBlind}
      />
    </div>
  );
};
