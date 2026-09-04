import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { fetchTransactions, analyzeTransaction, executeRecoveryAction } from '../services/api';
import { Transaction } from '../types';
import { StatusBadge, RiskBadge, ActionBadge } from '../components/Badges';
import { formatINR, formatDate } from '../utils/formatters';

interface TransactionsPageProps {
  onSelectTransaction: (id: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions({
        search,
        status: activeStatus,
        limit: 100
      });
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [search, activeStatus]);

  const handleQuickAnalyze = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionProcessingId(id);
    try {
      await analyzeTransaction(id);
      await loadTransactions();
    } catch (err) {
      alert('Analysis failed');
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleQuickExecute = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionProcessingId(id);
    try {
      await executeRecoveryAction(id);
      await loadTransactions();
    } catch (err) {
      alert('Action execution failed');
    } finally {
      setActionProcessingId(null);
    }
  };

  const statusTabs = [
    { id: 'all', label: 'All Transactions' },
    { id: 'at_risk', label: 'At Risk' },
    { id: 'recoverable', label: 'Recoverable' },
    { id: 'recovering', label: 'Recovering' },
    { id: 'recovered', label: 'Recovered' },
    { id: 'escalated', label: 'Escalated' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Payment Transactions</h1>
          <p className="text-sm text-slate-400">
            Searchable log of failed and at-risk transactions with real-time AI diagnosis and intervention actions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ID, Customer, Cause..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-64 shadow-inner"
            />
          </div>

          <button
            onClick={loadTransactions}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatus(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeStatus === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No transactions found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Failure Reason</th>
                  <th className="px-5 py-4">Risk</th>
                  <th className="px-5 py-4">AI Diagnosis</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn.transaction_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-300">
                      {txn.transaction_id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-100">{txn.customer_name}</div>
                      <div className="text-xs text-slate-400">{txn.customer_segment}</div>
                    </td>

                    <td className="px-5 py-4 font-extrabold text-slate-100">
                      {formatINR(txn.amount)}
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-amber-300 capitalize">
                      {txn.failure_reason.replace(/_/g, ' ')}
                    </td>

                    <td className="px-5 py-4">
                      <RiskBadge level={txn.risk_level} score={txn.risk_score} />
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-300 max-w-xs truncate">
                      {txn.ai_diagnosis || (
                        <span className="text-slate-500 italic">Not diagnosed yet</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <ActionBadge action={txn.recovery_action} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={txn.recovery_status} />
                    </td>

                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        {!txn.ai_diagnosis ? (
                          <button
                            onClick={(e) => handleQuickAnalyze(e, txn.transaction_id)}
                            disabled={actionProcessingId === txn.transaction_id}
                            className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900 text-xs font-medium flex items-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Diagnose</span>
                          </button>
                        ) : txn.recovery_status !== 'recovered' && txn.recovery_status !== 'escalated' ? (
                          <button
                            onClick={(e) => handleQuickExecute(e, txn.transaction_id)}
                            disabled={actionProcessingId === txn.transaction_id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900 text-xs font-medium"
                          >
                            <span>Execute</span>
                          </button>
                        ) : null}

                        <button
                          onClick={() => onSelectTransaction(txn.transaction_id)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
