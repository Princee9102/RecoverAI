import { Transaction } from '@prisma/client';

export interface PaymentExecutionResult {
  success: boolean;
  actionTaken: string;
  recoveredAmount: number;
  gatewayReference?: string;
  message: string;
  status: 'recovered' | 'failed' | 'scheduled' | 'communication_sent' | 'escalated';
}

export interface PaymentGateway {
  getGatewayName(): string;
  isMock(): boolean;
  executePaymentRetry(txn: Transaction): Promise<PaymentExecutionResult>;
  scheduleRetry(txn: Transaction): Promise<PaymentExecutionResult>;
  sendPaymentReminder(txn: Transaction): Promise<PaymentExecutionResult>;
  suggestAlternatePaymentMethod(txn: Transaction): Promise<PaymentExecutionResult>;
  sendCheckoutLink(txn: Transaction): Promise<PaymentExecutionResult>;
}
