import React, { useEffect, useState } from 'react';
import {
  Bot,
  Play,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { runBatchSimulation, fetchDashboardMetrics, runFailureDemo } from '../services/api';
import { BatchSimulationResult } from '../types';
import { formatINR } from '../utils/formatters';

interface RecoveryAgentPageProps {
  onNavigateToTransactions: () => void;
}

export const RecoveryAgentPage: React.FC<RecoveryAgentPageProps> = ({ onNavigateToTransactions }) => {
  const [metricsData, setMetricsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulationResult, setSimulationResult] = useState<BatchSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  const steps = [
    'Analyzing 105 synthetic transactions...',
    'Diagnosing payment failure causes...',
    'Checking recovery eligibility scores...',
    'Selecting AI recovery interventions...',
    'Applying backend safety rules & retry gates...',
    'Executing simulated sandbox payment retries & links...',
    'Writing immutable audit logs...'
  ];

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetchDashboardMetrics();
      setMetricsData(res);
    } catch (err) {
      console.error('Failed to load metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationStep(0);

    // Animate through progress steps
    for (let i = 0; i < steps.length; i++) {
      setSimulationStep(i);
      await new Promise((res) => setTimeout(res, 220));
    }

    try {
      const result = await runBatchSimulation();
      setSimulationResult(result);
      await loadMetrics();
    } catch (err) {
      alert('Batch simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const metrics = metricsData?.metrics || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border border-indigo-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-indigo-400" />
              <h1 className="text-3xl font-black text-white tracking-tight">Recovery Agent Operations</h1>
            </div>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Autonomous AI agent that orchestrates end-to-end revenue recovery workflows for failed Indian payment transactions. Passes every decision through deterministic backend safety gates.
            </p>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-extrabold text-lg shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 shrink-0"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>Run Recovery Simulation</span>
          </button>
        </div>
      </div>

      {/* Live Simulation Steps Modal / Banner */}
      {isSimulating && (
        <div className="bg-slate-900 border border-indigo-500/60 rounded-2xl p-6 shadow-2xl space-y-4 animate-pulse">
          <div className="flex items-center space-x-3 text-indigo-400 font-extrabold text-base">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Executing Batch Simulation Workflow...</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">{steps[simulationStep]}</span>
              <span>Step {simulationStep + 1} of {steps.length}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${((simulationStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Results Card (Dynamic) */}
      {simulationResult && !isSimulating && (
        <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/50 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">Simulation Batch Complete</span>
                <h2 className="text-2xl font-black text-white">{simulationResult.totalProcessed} Transactions Processed</h2>
              </div>
            </div>

            <button
              onClick={() => setSimulationResult(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-bold uppercase">Recoverable Transactions</span>
              <div className="text-2xl font-black text-indigo-300 mt-1">{simulationResult.recoverableCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">{formatINR(simulationResult.recoverableRevenue)} Volume</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-bold uppercase">Successfully Recovered</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{simulationResult.recoveredCount}</div>
              <p className="text-[11px] text-emerald-300 mt-1">{formatINR(simulationResult.recoveredRevenue)} Recovered</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-bold uppercase">Eligible Recovery Rate</span>
              <div className="text-2xl font-black text-sky-400 mt-1">{simulationResult.recoveryRate}%</div>
              <p className="text-[11px] text-slate-400 mt-1">Conversion metric</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-bold uppercase">Human Escalations</span>
              <div className="text-2xl font-black text-rose-400 mt-1">{simulationResult.escalationCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">Safety rules triggered</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <span className="text-xs font-bold uppercase text-slate-400">At-Risk Transactions</span>
          <div className="text-3xl font-black text-white">{metrics.totalTransactions || 0}</div>
          <p className="text-xs text-slate-400">Total transaction batch in dataset</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <span className="text-xs font-bold uppercase text-slate-400">Recoverable Revenue Volume</span>
          <div className="text-3xl font-black text-indigo-400">{formatINR(metrics.recoverableRevenue || 0)}</div>
          <p className="text-xs text-slate-400">{metrics.recoverableCount || 0} transactions eligible for agent retry</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <span className="text-xs font-bold uppercase text-slate-400">Actual Revenue Recovered</span>
          <div className="text-3xl font-black text-emerald-400">{formatINR(metrics.recoveredRevenue || 0)}</div>
          <p className="text-xs text-emerald-300 font-medium">{metrics.recoveredCount || 0} payments successfully collected</p>
        </div>
      </div>
    </div>
  );
};
