import React, { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { RecoveryAgentPage } from './pages/RecoveryAgentPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { SafetyRulesPage } from './pages/SafetyRulesPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

  const handleNavigate = (tab: string, txnId?: string) => {
    if (txnId) {
      setSelectedTxnId(txnId);
      setActiveTab('transaction-detail');
    } else {
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    if (activeTab === 'transaction-detail' && selectedTxnId) {
      return (
        <TransactionDetailPage
          transactionId={selectedTxnId}
          onBack={() => setActiveTab('transactions')}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'transactions':
        return (
          <TransactionsPage
            onSelectTransaction={(id) => handleNavigate('transaction-detail', id)}
          />
        );
      case 'recovery-agent':
        return (
          <RecoveryAgentPage
            onNavigateToTransactions={() => setActiveTab('transactions')}
          />
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'audit-trail':
        return <AuditTrailPage />;
      case 'safety-rules':
        return <SafetyRulesPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setSelectedTxnId(null);
        setActiveTab(tab);
      }}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default App;
