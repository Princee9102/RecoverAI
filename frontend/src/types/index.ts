export interface Transaction {
  id: string;
  transaction_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  payment_method: string;
  failure_reason: string;
  attempt_number: number;
  created_at: string;
  updated_at: string;
  customer_segment: string;
  subscription_status: string;
  previous_success_rate: number;
  days_since_last_payment: number;
  invoice_status: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  recovery_status: 'at_risk' | 'recoverable' | 'recovering' | 'recovered' | 'failed' | 'escalated' | 'unrecoverable';
  recovery_action: string | null;
  ai_diagnosis: string | null;
  ai_explanation: string | null;
  ai_confidence: number | null;
  recovered_amount: number;
  recovery_attempts: number;
  communication_attempts: number;
  recovery_actions?: RecoveryAction[];
  audit_logs?: AuditLog[];
}

export interface RecoveryAction {
  id: string;
  transaction_id: string;
  action_type: string;
  status: string;
  attempt_number: number;
  executed_at: string;
  gateway_response?: string;
  error_message?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  transaction_id: string;
  event_type: 'DIAGNOSIS' | 'SAFETY_GATE_CHECK' | 'RECOVERY_ACTION' | 'HUMAN_ESCALATION' | 'STOP_WORKFLOW';
  decision: string;
  reason: string;
  confidence: number;
  action: string;
  result: string;
  transaction?: {
    customer_name: string;
    amount: number;
    payment_method: string;
    failure_reason: string;
  };
}

export interface DashboardMetrics {
  totalTransactions: number;
  revenueAtRisk: number;
  recoverableRevenue: number;
  recoveredRevenue: number;
  recoveryRate: number;
  humanEscalations: number;
  recoveredCount: number;
  recoverableCount: number;
}

export interface BatchSimulationResult {
  totalProcessed: number;
  atRiskRevenue: number;
  recoverableCount: number;
  recoverableRevenue: number;
  recoveredCount: number;
  recoveredRevenue: number;
  recoveryRate: number;
  escalationCount: number;
  failedCount: number;
  averageRecoveryAmount: number;
  durationMs: number;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  mode: string;
  aiService: string;
  paymentGateway: string;
  isDemoAI: boolean;
  isMockGateway: boolean;
}

export interface SafetyRule {
  id: string;
  rule_key: string;
  rule_value: string;
  description: string;
  is_active: boolean;
}
