import React, { useState } from 'react';
import { X, Users, CheckCircle2, AlertTriangle, XCircle, Award, ArrowUpDown, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface CandidateCompareMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  applicationIds: string[];
  isBlind?: boolean;
}

export const CandidateCompareMatrix: React.FC<CandidateCompareMatrixProps> = ({
  isOpen,
  onClose,
  applicationIds,
  isBlind = false
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [candidates, setCandidates] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen && applicationIds.length >= 2) {
      loadComparison();
    }
  }, [isOpen, applicationIds, isBlind]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const res = await api.compareCandidates(applicationIds, isBlind);
      if (res && res.candidates) {
        setCandidates(res.candidates);
      }
    } catch (err) {
      console.error('Failed to load candidate comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0D1322] border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  CANDIDATE COMPARISON MATRIX
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {candidates.length} Candidates
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Side-by-side evidence comparison. All match percentages backed by verified citations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-20 text-slate-400">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Aggregating evidence across candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p>No candidates available for comparison.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-3 text-xs font-mono uppercase text-slate-400 w-48">Dimension</th>
                    {candidates.map(cand => (
                      <th key={cand.applicationId} className="p-3 text-sm font-bold text-white min-w-[220px]">
                        <div className="flex items-center justify-between gap-2">
                          <span>{isBlind ? `Candidate (${cand.blindCode})` : cand.candidateName}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 font-extrabold border border-blue-500/30">
                            {cand.overallScore}%
                          </span>
                        </div>
                        <p className="text-xs font-normal text-slate-400 mt-0.5">{cand.currentTitle || 'Professional'}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {/* Row: Fit Score */}
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-300">Overall Match</td>
                    {candidates.map(cand => (
                      <td key={cand.applicationId} className="p-3">
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-1">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2.5 rounded-full"
                            style={{ width: `${cand.overallScore}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">{cand.overallScore}% verified fit</span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Evidence Quality */}
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-300">Evidence Quality</td>
                    {candidates.map(cand => (
                      <td key={cand.applicationId} className="p-3 font-mono font-bold text-cyan-300">
                        {cand.evidenceQuality}% specificity
                      </td>
                    ))}
                  </tr>

                  {/* Row: Education */}
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-300">Degree & Education</td>
                    {candidates.map(cand => (
                      <td key={cand.applicationId} className="p-3 text-slate-200">
                        {cand.degree || 'Not documented'}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Strong Skills */}
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-300">Verified Strong Skills</td>
                    {candidates.map(cand => (
                      <td key={cand.applicationId} className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {cand.strongSkills?.slice(0, 4).map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 text-[10px]">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Missing Requirements */}
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-300">Missing Evidence</td>
                    {candidates.map(cand => (
                      <td key={cand.applicationId} className="p-3">
                        {cand.missingEvidence?.length === 0 ? (
                          <span className="text-emerald-400 font-mono">None (100% covered)</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {cand.missingEvidence?.map((m: string) => (
                              <span key={m} className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-500/20 text-[10px]">
                                ✕ {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            * All comparison data is derived strictly from candidate submitted resumes.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
