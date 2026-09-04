import React, { useEffect, useState } from 'react';
import { History, Search, Filter, ShieldCheck, Sparkles, AlertOctagon } from 'lucide-react';
import { fetchAuditLogs } from '../services/api';
import { AuditLog } from '../types';
import { formatDate } from '../utils/formatters';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('all');

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs({ search, eventType, page: 1 });
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [search, eventType]);

  const eventTypes = [
    { id: 'all', label: 'All Audit Events' },
    { id: 'DIAGNOSIS', label: 'AI Diagnosis' },
    { id: 'SAFETY_GATE_CHECK', label: 'Safety Policy Gate' },
    { id: 'RECOVERY_ACTION', label: 'Recovery Executions' },
    { id: 'HUMAN_ESCALATION', label: 'Human Escalations' },
    { id: 'STOP_WORKFLOW', label: 'Workflow Halts' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Immutable Audit Trail</span>
          </h1>
          <p className="text-sm text-slate-400">
            Complete, transparent ledger recording every AI diagnosis, policy gate check, and gateway action.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-64 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Event Type Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 overflow-x-auto pb-1">
        {eventTypes.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setEventType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              eventType === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No audit log events match criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4">Event Type</th>
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4">Decision</th>
                  <th className="px-5 py-4">Reason / Explanation</th>
                  <th className="px-5 py-4">Confidence</th>
                  <th className="px-5 py-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition text-xs">
                    <td className="px-5 py-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>

                    <td className="px-5 py-4 font-bold">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase border ${
                        log.event_type === 'DIAGNOSIS' ? 'bg-indigo-950 text-indigo-300 border-indigo-800' :
                        log.event_type === 'SAFETY_GATE_CHECK' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        log.event_type === 'RECOVERY_ACTION' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                        log.event_type === 'HUMAN_ESCALATION' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {log.event_type}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-indigo-300">
                      {log.transaction_id}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-100">
                      {log.decision}
                    </td>

                    <td className="px-5 py-4 text-slate-300 max-w-sm truncate">
                      {log.reason}
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-slate-300">
                      {Math.round(log.confidence * 100)}%
                    </td>

                    <td className="px-5 py-4 font-semibold text-emerald-400">
                      {log.result}
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
