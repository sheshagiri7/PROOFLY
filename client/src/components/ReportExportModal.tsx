import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { FullApplicationReport } from '../services/api';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullApplicationReport;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ isOpen, onClose, report }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0D1322] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Controls */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Candidate Evaluation Report</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#090D18] print:bg-white print:text-black">
          {/* Document Header */}
          <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xl text-white print:text-black tracking-wider">PROOFLY</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 print:text-blue-700 border border-blue-500/30 font-mono uppercase">
                  Candidate Report
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Evidence-First Recruitment Intelligence • Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black font-mono text-blue-400 print:text-blue-700">
                {report.scores?.overallScore || 87}%
              </span>
              <p className="text-[10px] uppercase font-mono text-slate-400 print:text-slate-600">Overall Match</p>
            </div>
          </div>

          {/* Candidate & Role Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600">Candidate Profile</p>
              <h4 className="text-base font-bold text-white print:text-black mt-0.5">{report.candidate.name}</h4>
              <p className="text-xs text-slate-300 print:text-slate-700">{report.candidate.currentTitle || 'Candidate'}</p>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">{report.candidate.email} • {report.candidate.location}</p>
              <p className="text-xs text-slate-400 print:text-slate-600">{report.candidate.degree} ({report.candidate.institution})</p>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600">Target Role</p>
              <h4 className="text-base font-bold text-white print:text-black mt-0.5">{report.job.title}</h4>
              <p className="text-xs text-slate-300 print:text-slate-700">{report.job.company} • {report.job.location}</p>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">Resume: {report.resume.filename}</p>
              <p className="text-xs font-mono text-cyan-400 print:text-cyan-700">Evidence Quality Score: {report.scores?.evidenceQuality}%</p>
            </div>
          </div>

          {/* Score Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <p className="text-[10px] uppercase font-mono text-slate-400 print:text-slate-600">Current Fit</p>
              <p className="text-xl font-bold font-mono text-emerald-400 print:text-emerald-700">{report.scores?.currentFit}%</p>
              <p className="text-[10px] text-slate-500">Verified Evidence</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <p className="text-[10px] uppercase font-mono text-slate-400 print:text-slate-600">Evidence Quality</p>
              <p className="text-xl font-bold font-mono text-cyan-400 print:text-cyan-700">{report.scores?.evidenceQuality}%</p>
              <p className="text-[10px] text-slate-500">Citations & Depth</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <p className="text-[10px] uppercase font-mono text-slate-400 print:text-slate-600">Potential Fit</p>
              <p className="text-xl font-bold font-mono text-purple-400 print:text-purple-700">{report.scores?.potentialFit}%</p>
              <p className="text-[10px] text-slate-500">AI Analysis</p>
            </div>
          </div>

          {/* Evaluation Summary */}
          {report.report?.summary && (
            <div className="space-y-1.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">Executive Summary</h5>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed bg-slate-900/40 print:bg-slate-50 p-3 rounded-lg border border-slate-800 print:border-slate-200">
                {report.report.summary}
              </p>
            </div>
          )}

          {/* Evidence Items Breakdown */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
              Verified Requirement Citations ({report.evidenceItems.length})
            </h5>
            <div className="space-y-2">
              {report.evidenceItems.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-900/50 print:bg-slate-50 border border-slate-800 print:border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white print:text-black">{item.req_description}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        item.match_status === 'MATCHED'
                          ? 'bg-emerald-500/20 text-emerald-300 print:text-emerald-700'
                          : item.match_status === 'PARTIAL'
                          ? 'bg-amber-500/20 text-amber-300 print:text-amber-700'
                          : 'bg-rose-500/20 text-rose-300 print:text-rose-700'
                      }`}
                    >
                      {item.match_status}
                    </span>
                  </div>
                  <p className="text-slate-400 print:text-slate-600">{item.explanation}</p>
                  <p className="font-mono text-[11px] text-slate-300 print:text-slate-800 bg-black/40 print:bg-slate-200 p-2 rounded">
                    "{item.evidence_text}" (Source: {item.source_section})
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 print:border-slate-300">
              <p className="font-bold text-emerald-300 print:text-emerald-700 mb-1.5 uppercase text-[10px]">Verified Strong Skills</p>
              <ul className="space-y-1">
                {report.report?.strongSkills?.map((s: string) => (
                  <li key={s} className="text-slate-300 print:text-slate-700">✓ {s}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 print:border-slate-300">
              <p className="font-bold text-amber-300 print:text-amber-700 mb-1.5 uppercase text-[10px]">Partial Skills</p>
              <ul className="space-y-1">
                {report.report?.partialSkills?.length === 0 ? (
                  <li className="text-slate-500 italic">None</li>
                ) : (
                  report.report?.partialSkills?.map((s: string) => (
                    <li key={s} className="text-slate-300 print:text-slate-700">⚠ {s}</li>
                  ))
                )}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 print:border-slate-300">
              <p className="font-bold text-rose-300 print:text-rose-700 mb-1.5 uppercase text-[10px]">Missing Evidence</p>
              <ul className="space-y-1">
                {report.report?.missingEvidence?.length === 0 ? (
                  <li className="text-emerald-400">Complete coverage</li>
                ) : (
                  report.report?.missingEvidence?.map((s: string) => (
                    <li key={s} className="text-slate-300 print:text-slate-700">✕ {s}</li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Recruiter Notes & Limitations */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 print:border-slate-300 text-xs space-y-2">
            {report.report?.recruiterNotes && (
              <div>
                <p className="font-bold text-slate-200 print:text-black uppercase text-[10px]">Recruiter Evaluation Notes</p>
                <p className="text-slate-400 print:text-slate-600 mt-0.5">{report.report.recruiterNotes}</p>
              </div>
            )}
            <div>
              <p className="font-bold text-slate-200 print:text-black uppercase text-[10px]">Methodology & Limitations</p>
              <p className="text-slate-400 print:text-slate-600 mt-0.5">{report.report?.limitations}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
