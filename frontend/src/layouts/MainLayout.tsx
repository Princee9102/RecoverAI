import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Bot,
  BarChart3,
  ShieldCheck,
  History,
  Sparkles,
  Zap,
  ShieldAlert,
  Database,
  RefreshCw
} from 'lucide-react';
import { fetchHealth, regenerateDataset } from '../services/api';
import { SystemHealth } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshData?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onRefreshData
}) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const loadHealth = async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to fetch system health', err);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleResetDataset = async () => {
    if (confirm('Are you sure you want to reset the synthetic transaction dataset back to initial 105 transactions?')) {
      setIsResetting(true);
      try {
        await regenerateDataset();
        if (onRefreshData) onRefreshData();
      } catch (err) {
        alert('Failed to reset dataset');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'recovery-agent', label: 'Recovery Agent', icon: Bot, highlight: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audit-trail', label: 'Audit Trail', icon: History },
    { id: 'safety-rules', label: 'Safety & Controls', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner & Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-400">
                  RecoverAI
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  Track 03 — Revenue Recovery
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Razorpay AI Buildathon 2026</p>
            </div>
          </div>
        </div>

        {/* System Badges & Actions */}
        <div className="flex items-center space-x-3">
          {health?.isDemoAI && (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <Sparkles className="w-3.5 h-3.5" />
              <span>DEMO MODE (Deterministic AI & Mock Gateway)</span>
            </div>
          )}

          {!health?.isDemoAI && health && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>LIVE AI CONNECTED</span>
            </div>
          )}

          <button
            onClick={handleResetDataset}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Reset Synthetic Dataset"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Dataset</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900/90 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Operations Portal
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && !isActive && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Safety Status Sidebar Widget */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Safety Gate Guard Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AI proposes decisions. Hardcoded backend policy rules validate all recovery actions before execution.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
