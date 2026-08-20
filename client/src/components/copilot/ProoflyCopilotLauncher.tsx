import React, { useState } from 'react';
import { Bot, Cpu, Sparkles } from 'lucide-react';
import { ProoflyCopilot } from './ProoflyCopilot';

interface LauncherProps {
  applicationId?: string;
  candidateId?: string;
  jobId?: string;
  candidateName?: string;
  jobTitle?: string;
  overallScore?: number;
  onOpenEvidenceChain?: (evidenceId?: string) => void;
  onOpenSimulator?: (simData?: any) => void;
}

export const ProoflyCopilotLauncher: React.FC<LauncherProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 group flex items-center gap-2.5 border border-blue-400/30 font-sans"
        title="PROOFLY COPILOT™️ - Evidence-Grounded AI"
      >
        <div className="relative">
          <Cpu className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#070B14] animate-pulse" />
        </div>
        <span className="hidden sm:inline-block font-bold text-xs tracking-wide">
          {isOpen ? 'Close Copilot' : 'PROOFLY COPILOT™️'}
        </span>
      </button>

      {/* PROOFLY COPILOT Drawer Window */}
      <ProoflyCopilot
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        {...props}
      />
    </>
  );
};
