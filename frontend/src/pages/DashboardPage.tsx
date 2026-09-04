import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Play,
  RotateCcw,
  Zap,
  ShieldCheck,
  BarChart2,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { fetchDashboardMetrics, runFailureDemo } from '../services/api';
import { formatINR } from '../utils/formatters';

interface DashboardPageProps {
  onNavigate: (tab: string, txnId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failureDemoResult, setFailureDemoResult] = useState<any>(null);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchDashboardMetrics();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunFailureDemo = async () => {
    setIsDemoRunning(true);
    try {
      const res = await runFailureDemo();
      setFailureDemoResult(res);
      await loadData();
    } catch (err) {
      alert('Failure demo error');
    } finally {
      setIsDemoRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-indigo-400 font-medium">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Dashboard Metrics from Database...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

  const revenueComparisonData = [
    { name: 'Revenue At Risk', amount: metrics.revenueAtRisk, fill: '#f59e0b' },
    { name: 'Recoverable', amount: metrics.recoverableRevenue, fill: '#6366f1' },
    { name: 'Recovered', amount: metrics.recoveredRevenue, fill: '#10b981' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Header & Quick Pitch Actions */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Merchant Recovery Operations Dashboard</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                Autonomous Recovery Engine
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Real-time payment failure analysis, automated eligibility scoring, safety-gated interventions, and revenue recovery tracking.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigate('recovery-agent')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Run Recovery Simulation</span>
            </button>

            <button
              onClick={handleRunFailureDemo}
              disabled={isDemoRunning}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/50 font-semibold text-sm transition"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{isDemoRunning ? 'Simulating...' : 'Simulate Gateway Failure'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controlled Failure Pitch Demo Result Modal / Alert */}
      {failureDemoResult && (
        <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-2xl relative space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
              <span>Controlled Failure Simulation Result (Pitch Scenario)</span>
            </div>
            <button
              onClick={() => setFailureDemoResult(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Demo Alert ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {failureDemoResult.steps.map((step: any, idx: number) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Step {idx + 1}</span>
                <p className="font-semibold text-slate-200">{step.title}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6 Top KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Transactions"
          value={metrics.totalTransactions}
          subtitle="Processed batch size"
          icon={BarChart2}
          color="indigo"
        />

        <StatCard
          title="Revenue At Risk"
          value={formatINR(metrics.revenueAtRisk)}
          subtitle="Failed transaction volume"
          icon={AlertTriangle}
          color="amber"
        />

        <StatCard
          title="Recoverable Revenue"
          value={formatINR(metrics.recoverableRevenue)}
          subtitle={`${metrics.recoverableCount} transactions eligible`}
          icon={Zap}
          color="purple"
        />

        <StatCard
          title="Recovered Revenue"
          value={formatINR(metrics.recoveredRevenue)}
          subtitle={`${metrics.recoveredCount} payments collected`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Recovery Rate"
          value={`${metrics.recoveryRate}%`}
          subtitle="Eligible conversion rate"
          icon={TrendingUp}
          color="sky"
        />

        <StatCard
          title="Human Escalations"
          value={metrics.humanEscalations}
          subtitle="Safety limits triggered"
          icon={Users}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue At Risk vs Recovered */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Revenue Recovery Breakdown</h3>
              <p className="text-xs text-slate-400">Total Volume at Risk vs Eligible & Successfully Recovered</p>
            </div>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/40">
              {metrics.recoveryRate}% Rate
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {revenueComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Recovery Rate by Failure Reason */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-100">Recovery Rate by Failure Cause</h3>
            <p className="text-xs text-slate-400">Efficacy across different bank failure reasons</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.failureReasonBreakdown || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" unit="%" stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <YAxis dataKey="reason" type="category" stroke="#94a3b8" fontSize={10} width={130} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Recovery Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="rate" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Transactions by Recovery Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-100">Recovery Status Distribution</h3>
            <p className="text-xs text-slate-400">Lifecycle states of synthetic transaction batch</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ status, count }: any) => `${status}: ${count}`}
                >
                  {(charts.statusDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: AI Recommended Recovery Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-100">AI Intervention Selection Distribution</h3>
            <p className="text-xs text-slate-400">Actions selected by AI and validated by Safety Gate</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.actionDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="action" stroke="#94a3b8" fontSize={9} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
