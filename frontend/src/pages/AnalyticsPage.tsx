import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Award, Clock } from 'lucide-react';
import { fetchAnalytics } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetchAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-indigo-400 font-medium">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Recovery Performance Analytics...</span>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const segments = data?.segmentPerformance || [];
  const simulationRuns = data?.simulationRuns || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Recovery Performance Analytics</h1>
        <p className="text-sm text-slate-400">
          In-depth financial efficiency metrics, customer segment recovery performance, and batch simulation history.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase">Average Recovered Ticket</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{formatINR(summary.avgRecoveryAmount)}</div>
          <p className="text-[11px] text-slate-400 mt-1">Per successful recovery</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase">Overall Recovery Rate</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{summary.recoveryRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{summary.recoveredCount} / {summary.totalTransactions} recovered</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase">Human Escalation Rate</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{summary.escalationRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{summary.escalatedCount} human tickets</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Recovered Revenue</span>
          <div className="text-2xl font-black text-emerald-300 mt-1">{formatINR(summary.totalRecoveredRevenue)}</div>
          <p className="text-[11px] text-slate-400 mt-1">Out of {formatINR(summary.totalAtRiskRevenue)} at risk</p>
        </div>
      </div>

      {/* Segment Performance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-white">Recovery Performance by Customer Segment</h3>
          <p className="text-xs text-slate-400">Analysis across Enterprise, SMB, Startup, and Consumer tiers</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Customer Segment</th>
                <th className="px-5 py-3.5">Total Failed Txns</th>
                <th className="px-5 py-3.5">Recovered Txns</th>
                <th className="px-5 py-3.5">Recovery Rate</th>
                <th className="px-5 py-3.5">Revenue At Risk</th>
                <th className="px-5 py-3.5">Revenue Recovered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {segments.map((seg: any) => (
                <tr key={seg.segment} className="hover:bg-slate-800/50">
                  <td className="px-5 py-4 font-bold text-slate-100">{seg.segment}</td>
                  <td className="px-5 py-4 font-mono">{seg.total}</td>
                  <td className="px-5 py-4 font-mono text-emerald-400">{seg.recovered}</td>
                  <td className="px-5 py-4 font-bold text-indigo-400">{seg.rate}%</td>
                  <td className="px-5 py-4 text-amber-300 font-semibold">{formatINR(seg.revenueAtRisk)}</td>
                  <td className="px-5 py-4 text-emerald-300 font-extrabold">{formatINR(seg.revenueRecovered)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Simulation History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="font-extrabold text-base text-white">Recent Simulation Runs History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Batch Size</th>
                <th className="px-5 py-3">Recoverable</th>
                <th className="px-5 py-3">Recovered</th>
                <th className="px-5 py-3">Recovered Volume</th>
                <th className="px-5 py-3">Recovery Rate</th>
                <th className="px-5 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {simulationRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-4 text-center text-slate-500 text-xs italic">
                    No batch simulation runs executed yet. Click "Run Recovery Simulation" on Recovery Agent page.
                  </td>
                </tr>
              ) : (
                simulationRuns.map((run: any) => (
                  <tr key={run.id} className="hover:bg-slate-800/50 text-xs">
                    <td className="px-5 py-3 font-mono">{formatDate(run.run_at)}</td>
                    <td className="px-5 py-3 font-semibold">{run.total_processed}</td>
                    <td className="px-5 py-3 text-indigo-300">{run.recoverable_count}</td>
                    <td className="px-5 py-3 text-emerald-400 font-bold">{run.recovered_count}</td>
                    <td className="px-5 py-3 text-emerald-300 font-extrabold">{formatINR(run.recovered_amount)}</td>
                    <td className="px-5 py-3 text-sky-300 font-bold">{run.recovery_rate}%</td>
                    <td className="px-5 py-3 font-mono text-slate-400">{run.duration_ms} ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
