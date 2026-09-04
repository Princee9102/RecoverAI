import React from 'react';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    at_risk: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    recoverable: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
    recovering: 'bg-sky-950/80 text-sky-300 border-sky-500/40 animate-pulse',
    recovered: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    escalated: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    failed: 'bg-red-950/80 text-red-300 border-red-500/40',
    unrecoverable: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const labels: Record<string, string> = {
    at_risk: 'At Risk',
    recoverable: 'Recoverable',
    recovering: 'Recovering...',
    recovered: 'Recovered',
    escalated: 'Escalated',
    failed: 'Failed',
    unrecoverable: 'Unrecoverable'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.at_risk}`}>
      {labels[status] || status}
    </span>
  );
};

export const RiskBadge: React.FC<{ level: string; score?: number }> = ({ level, score }) => {
  const styles: Record<string, string> = {
    low: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
    medium: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
    high: 'bg-rose-950/60 text-rose-400 border-rose-800/40'
  };

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${styles[level] || styles.medium}`}>
      <span>{level}</span>
      {score !== undefined && <span className="opacity-75">({Math.round(score * 100)}%)</span>}
    </span>
  );
};

export const ActionBadge: React.FC<{ action: string | null }> = ({ action }) => {
  if (!action) return <span className="text-slate-500 text-xs italic">Pending Diagnosis</span>;

  const labels: Record<string, string> = {
    retry_payment: 'Retry Payment',
    schedule_retry: 'Schedule Retry',
    send_payment_reminder: 'Payment Reminder',
    suggest_alternate_payment_method: 'Alternate Payment',
    send_checkout_link: 'Checkout Link',
    escalate_to_human: 'Human Escalation',
    stop_recovery: 'Stop Workflow'
  };

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-indigo-300 border border-slate-700">
      {labels[action] || action}
    </span>
  );
};
