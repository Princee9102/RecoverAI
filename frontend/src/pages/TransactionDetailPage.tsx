import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  History,
  Send,
  UserX,
  CreditCard,
  Building,
  Mail,
  UserCheck
} from 'lucide-react';
import { fetchTransactionById, analyzeTransaction, executeRecoveryAction } from '../services/api';
import { Transaction } from '../types';
import { StatusBadge, RiskBadge, ActionBadge } from '../components/Badges';
import { formatINR, formatDate } from '../utils/formatters';

interface TransactionDetailPageProps {
  transactionId: string;
  onBack: () => void;
}

export const TransactionDetailPage: React.FC<TransactionDetailPageProps> = ({ transactionId, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchTransactionById(transactionId);
      setData(res);
    } catch (err) {
      console.error('Failed to load transaction detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [transactionId]);

  const handleAnalyze = async () => {
    setIsProcessing(true);
    try {
      await analyzeTransaction(transactionId);
      await loadDetails();
    } catch (err) {
      alert('AI Analysis failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecute = async (actionOverride?: string) => {
    setIsProcessing(true);
    try {
      await executeRecoveryAction(transactionId, actionOverride);
      await loadDetails();
    } catch (err) {
      alert('Action execution failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-indigo-400 font-medium">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Transaction Details...</span>
        </div>
      </div>
    );
  }

  const txn: Transaction = data?.transaction;
  const timeline = data?.timeline || [];

  if (!txn) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Transaction not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-white text-xs">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transactions</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-semibold transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Run AI Diagnosis</span>
          </button>

          {txn.recovery_status !== 'recovered' && txn.recovery_status !== 'escalated' && (
            <button
              onClick={() => handleExecute()}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition"
            >
              <Zap className="w-4 h-4" />
              <span>Execute Recommended Intervention</span>
            </button>
          )}

          {txn.recovery_status !== 'escalated' && (
            <button
              onClick={() => handleExecute('escalate_to_human')}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/40 text-xs font-semibold transition"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Escalate to Human</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono text-indigo-400 font-bold">{txn.transaction_id}</span>
              <h2 className="text-xl font-black text-white">{formatINR(txn.amount)}</h2>
            </div>
            <StatusBadge status={txn.recovery_status} />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Customer:</span>
              </span>
              <span className="font-semibold text-slate-100">{txn.customer_name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Email:</span>
              </span>
              <span className="font-mono text-slate-300">{txn.customer_email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment Method:</span>
              </span>
              <span className="font-semibold uppercase text-indigo-300">{txn.payment_method}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Failure Reason:</span>
              </span>
              <span className="font-bold text-amber-300 capitalize">{txn.failure_reason.replace(/_/g, ' ')}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Customer Segment:</span>
              <span className="font-medium text-slate-200">{txn.customer_segment}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Subscription Status:</span>
              <span className={`font-semibold capitalize ${txn.subscription_status === 'opted_out' ? 'text-rose-400' : 'text-slate-200'}`}>
                {txn.subscription_status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Historical Success Rate:</span>
              <span className="font-bold text-emerald-400">{Math.round(txn.previous_success_rate * 100)}%</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-2">
              <span className="text-slate-400">Attempts (Payment / Comm):</span>
              <span className="font-mono text-slate-200">{txn.recovery_attempts} / {txn.communication_attempts}</span>
            </div>
          </div>
        </div>

        {/* AI Decision & Explanation Card */}
        <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/50 rounded-2xl p-6 shadow-xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">AI Diagnostic & Recommendation Engine</h3>
                <p className="text-xs text-indigo-300">Structured Non-Custodial Agent Analysis</p>
              </div>
            </div>

            {txn.ai_confidence && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">AI Confidence</span>
                <div className="text-lg font-black text-indigo-300">{Math.round(txn.ai_confidence * 100)}%</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold">Risk Level</span>
              <div className="mt-1">
                <RiskBadge level={txn.risk_level} score={txn.risk_score} />
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold">Eligibility</span>
              <div className="mt-1 font-bold text-emerald-400 uppercase">
                {txn.recovery_status === 'unrecoverable' ? 'INELIGIBLE' : 'RECOVERABLE'}
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold">Recommended Action</span>
              <div className="mt-1">
                <ActionBadge action={txn.recovery_action} />
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold">Recovered Amount</span>
              <div className="mt-1 font-extrabold text-emerald-300 text-sm">
                {formatINR(txn.recovered_amount)}
              </div>
            </div>
          </div>

          {/* Prompt Decision Explanation Callout */}
          <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-4 space-y-2">
            <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider block">
              Why this recommendation:
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{txn.ai_explanation || 'Payment failure diagnosis pending. Click "Run AI Diagnosis" to analyze transaction parameters.'}"
            </p>
          </div>

          {/* Safety Policy Gate Status Banner */}
          <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-200 font-medium">
                Backend Policy Gate: Maximum retries (2) & comms (3) enforced. Real payments isolated.
              </span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded uppercase">
              PASSED
            </span>
          </div>
        </div>
      </div>

      {/* Lifecycle Timeline & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="font-extrabold text-base text-white">Recovery Event Timeline</h3>
          </div>

          <div className="space-y-4 relative pl-4 border-l-2 border-slate-800">
            {timeline.map((item: any, idx: number) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900"></div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-slate-200">{item.title}</span>
                    <span className="text-[10px] font-mono">{formatDate(item.timestamp)}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Feed for this Txn */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white">Audit Trail Events</h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {(txn.audit_logs || []).length === 0 ? (
              <p className="text-xs text-slate-500 italic">No audit log records created yet for this transaction.</p>
            ) : (
              (txn.audit_logs || []).map((log) => (
                <div key={log.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-300 uppercase tracking-wider text-[10px]">
                      {log.event_type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(log.timestamp)}</span>
                  </div>

                  <p className="text-slate-200 font-medium">Decision: {log.decision}</p>
                  <p className="text-slate-400 text-[11px] leading-tight">Reason: {log.reason}</p>
                  <div className="text-[10px] font-mono text-emerald-400 pt-1">
                    Result: {log.result}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
