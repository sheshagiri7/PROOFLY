import React, { useState } from 'react';
import { Sliders, RefreshCw, Sparkles, TrendingUp, TrendingDown, AlertCircle, Check } from 'lucide-react';
import { api, FullApplicationReport } from '../services/api';

interface JobGapSimulatorProps {
  report: FullApplicationReport;
}

export const JobGapSimulator: React.FC<JobGapSimulatorProps> = ({ report }) => {
  const originalScore = report.scores?.overallScore || 87;
  const breakdown = report.scores?.breakdown?.requirements || [];

  // Initialize weights from report
  const initialWeights: Record<string, number> = {};
  breakdown.forEach(req => {
    initialWeights[req.id] = req.weight;
  });

  const [weights, setWeights] = useState<Record<string, number>>(initialWeights);
  const [simulatedScore, setSimulatedScore] = useState<number>(originalScore);
  const [explanation, setExplanation] = useState<string>(
    'Adjust requirement weights below to simulate how shifting priorities impact candidate match score.'
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleSliderChange = async (reqId: string, newWeight: number) => {
    const updated = { ...weights, [reqId]: newWeight };
    setWeights(updated);

    try {
      setIsSimulating(true);
      const res = await api.simulateJobWeights(report.job.id, report.applicationId, updated);
      if (res && res.simulation) {
        setSimulatedScore(res.simulation.simulatedScore);
        setExplanation(res.simulation.explanation);
      }
    } catch (err) {
      console.warn('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetWeights = () => {
    setWeights(initialWeights);
    setSimulatedScore(originalScore);
    setExplanation('Weights reset to baseline job description specification.');
  };

  const delta = simulatedScore - originalScore;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                JOB GAP SIMULATOR
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                WHAT-IF ANALYSIS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              “What would make this candidate a better match?” Dynamically simulate weight adjustments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] text-slate-400 font-mono">Simulated Match</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono text-cyan-400">
                {simulatedScore}%
              </span>
              {delta !== 0 && (
                <span
                  className={`text-xs font-mono font-bold flex items-center gap-0.5 px-2 py-0.5 rounded ${
                    delta > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {delta > 0 ? `+${delta}%` : `${delta}%`}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={resetWeights}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reset weights to default"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Explanation Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {explanation}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            * Note: Simulation evaluates algorithmic weight impact. Never present simulation as an actual verified resume fact.
          </p>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Requirement Priority Weights
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {breakdown.map(req => {
            const currentWeight = weights[req.id] !== undefined ? weights[req.id] : req.weight;
            const isMatched = req.status === 'MATCHED';
            const isPartial = req.status === 'PARTIAL';

            return (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isMatched
                          ? 'bg-emerald-400'
                          : isPartial
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    ></span>
                    <span className="font-semibold text-slate-200 truncate">{req.title}</span>
                  </div>
                  <span className="font-mono text-xs text-cyan-300 font-bold">
                    {currentWeight}% weight
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={currentWeight}
                  onChange={e => handleSliderChange(req.id, Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Candidate: {req.status}</span>
                  <span>Contribution: {req.contribution}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
