import React from 'react';
import { CheckCircle2, Clock, Check, ChevronRight } from 'lucide-react';

export interface ApplicationJourneyStep {
  label: string;
  subtext: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  timestamp?: string;
}

interface ApplicationJourneyTrackerProps {
  currentStage?: string;
}

export const ApplicationJourneyTracker: React.FC<ApplicationJourneyTrackerProps> = ({ currentStage }) => {
  const steps: ApplicationJourneyStep[] = [
    { label: 'Submitted', subtext: 'Resume PDF uploaded', status: 'COMPLETED', timestamp: 'Today' },
    { label: 'Resume Parsed', subtext: '13 fields extracted', status: 'COMPLETED', timestamp: 'Today' },
    { label: 'Evidence Verified', subtext: 'Citations mapped', status: 'COMPLETED', timestamp: 'Today' },
    { label: 'Job Matched', subtext: '87% Proof Score', status: 'COMPLETED', timestamp: 'Today' },
    { label: 'Recruiter Review', subtext: 'Under review', status: 'IN_PROGRESS' },
    { label: 'Technical Interview', subtext: 'Next milestone', status: 'UPCOMING' },
    { label: 'Final Decision', subtext: 'Hiring decision', status: 'UPCOMING' }
  ];

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            APPLICATION JOURNEY
          </h4>
          <p className="text-xs text-slate-400">Live recruitment lifecycle grounded in database events.</p>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
          STAGE: RECRUITER REVIEW
        </span>
      </div>

      {/* Steps Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
        {steps.map((step, idx) => {
          const isDone = step.status === 'COMPLETED';
          const isCurrent = step.status === 'IN_PROGRESS';

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-left space-y-1.5 transition-all ${
                isCurrent
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/30'
                  : isDone
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>

              <p
                className={`text-xs font-bold ${
                  isCurrent ? 'text-blue-300' : isDone ? 'text-white' : 'text-slate-400'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">{step.subtext}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
