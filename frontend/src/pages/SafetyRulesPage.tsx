import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { fetchSafetyRules } from '../services/api';
import { SafetyRule } from '../types';

export const SafetyRulesPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSafety = async () => {
    setLoading(true);
    try {
      const res = await fetchSafetyRules();
      setData(res);
    } catch (err) {
      console.error('Failed to load safety rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSafety();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-indigo-400 font-medium">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Safety & Control Policies...</span>
        </div>
      </div>
    );
  }

  const rules: SafetyRule[] = data?.rules || [];
  const allowedActions = data?.allowedActions || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          <span>Safety & Governance Controls</span>
        </h1>
        <p className="text-sm text-slate-400">
          Strict, non-custodial backend policy guardrails that dictate which AI recommendations are permitted to execute.
        </p>
      </div>

      {/* Safety Policy Core Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm uppercase tracking-wider">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Backend Safety Model Paradigm</span>
        </div>
        <p className="text-base font-medium text-slate-100 leading-relaxed">
          "{data?.policyNotice}"
        </p>
      </div>

      {/* 6 Key Safety Rules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Automated Payment Retries</span>
          <div className="text-3xl font-black text-emerald-400">MAX 2</div>
          <p className="text-xs text-slate-400">Hard limit on bank payment retry attempts per transaction.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Recovery Communications</span>
          <div className="text-3xl font-black text-indigo-400">MAX 3</div>
          <p className="text-xs text-slate-400">Maximum SMS / Email / WhatsApp reminders per transaction.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Stop After Recovery</span>
          <div className="text-3xl font-black text-emerald-300">YES</div>
          <p className="text-xs text-slate-400">Workflow terminates immediately upon payment collection.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Stop On Opt-Out</span>
          <div className="text-3xl font-black text-emerald-300">YES</div>
          <p className="text-xs text-slate-400">Halt interventions if customer unsubscribes or opts out.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Human Escalation</span>
          <div className="text-3xl font-black text-rose-400">ENABLED</div>
          <p className="text-xs text-slate-400">Auto-escalates to human team after repeated failures.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Real Money Transactions</span>
          <div className="text-3xl font-black text-rose-500">DISABLED</div>
          <p className="text-xs text-slate-400">Strict sandbox simulation mode active. Never charges live accounts.</p>
        </div>
      </div>

      {/* Allowed Actions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-white">Allowed AI Action Registry</h3>
          <p className="text-xs text-slate-400">AI recommendations outside this strict allowlist are rejected by the backend</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Allowed Action Key</th>
                <th className="px-5 py-3.5">Action Description</th>
                <th className="px-5 py-3.5">Safety Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {allowedActions.map((act: any) => (
                <tr key={act.action} className="hover:bg-slate-800/50">
                  <td className="px-5 py-4 font-mono font-bold text-indigo-300">{act.action}</td>
                  <td className="px-5 py-4 text-slate-200">{act.description}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-400">{act.maxLimit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
