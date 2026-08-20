import React from 'react';
import { EyeOff, Eye, ShieldAlert } from 'lucide-react';

interface BlindScreeningToggleProps {
  isBlind: boolean;
  onToggle: (enabled: boolean) => void;
}

export const BlindScreeningToggle: React.FC<BlindScreeningToggleProps> = ({ isBlind, onToggle }) => {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isBlind ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
        }`}>
          {isBlind ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-xs font-semibold text-white leading-none">
            Blind Screening Mode
          </p>
          <p className="text-[10px] text-slate-400">
            {isBlind ? 'Candidate PII redacted (anonymized)' : 'Candidate identity visible'}
          </p>
        </div>
      </div>

      <button
        onClick={() => onToggle(!isBlind)}
        className={`ml-2 relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isBlind ? 'bg-indigo-600' : 'bg-slate-700'
        }`}
        role="switch"
        aria-checked={isBlind}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            isBlind ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
