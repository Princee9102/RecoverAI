import { AIService } from './AIService';
import { AIDecision, AIDecisionSchema } from '../../schemas/recovery.schema';
import { Transaction } from '@prisma/client';

export class DemoAIService implements AIService {
  getServiceName(): string {
    return 'DemoAIService (Deterministic Rule Engine)';
  }

  async diagnoseAndRecommend(txn: Transaction): Promise<AIDecision> {
    // Artificial slight latency to simulate real AI processing feel
    await new Promise((res) => setTimeout(res, 80));

    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    let diagnosis = 'Payment transaction failed.';
    let recoverable = true;
    let recommendedAction:
      | 'retry_payment'
      | 'schedule_retry'
      | 'send_payment_reminder'
      | 'suggest_alternate_payment_method'
      | 'send_checkout_link'
      | 'escalate_to_human'
      | 'stop_recovery' = 'schedule_retry';
    let reason = '';
    let confidence = 0.88;

    if (txn.subscription_status === 'opted_out') {
      riskLevel = 'high';
      diagnosis = 'Customer has opted out of communications.';
      recoverable = false;
      recommendedAction = 'stop_recovery';
      reason = 'Customer explicit opt-out recorded in subscription status.';
      confidence = 0.99;
    } else if (txn.recovery_attempts >= 2) {
      riskLevel = 'high';
      diagnosis = 'Automated retries exhausted without resolution.';
      recoverable = false;
      recommendedAction = 'escalate_to_human';
      reason = 'Maximum automated payment retries reached. Requires manual human account manager intervention.';
      confidence = 0.95;
    } else {
      switch (txn.failure_reason) {
        case 'bank_timeout':
        case 'network_error':
          riskLevel = 'low';
          diagnosis = `Temporary ${txn.failure_reason.replace('_', ' ')} at issuing bank gateway.`;
          recoverable = true;
          if (txn.previous_success_rate > 0.7) {
            recommendedAction = 'retry_payment';
            reason = `High historical payment success rate (${Math.round(txn.previous_success_rate * 100)}%) indicates transient network failure. Immediate retry recommended.`;
            confidence = 0.92;
          } else {
            recommendedAction = 'schedule_retry';
            reason = 'Temporary bank downtime detected. Scheduling retry during off-peak bank processing window (2 hours).';
            confidence = 0.89;
          }
          break;

        case 'insufficient_funds':
          riskLevel = 'medium';
          diagnosis = 'Account balance insufficient at time of debit attempt.';
          recoverable = true;
          if (txn.days_since_last_payment > 25 && txn.days_since_last_payment < 35) {
            recommendedAction = 'schedule_retry';
            reason = 'Customer salary credit cycle expected within 48 hours based on payment history. Scheduled retry recommended.';
            confidence = 0.86;
          } else {
            recommendedAction = 'send_payment_reminder';
            reason = 'Friendly payment reminder with option to top up account or switch payment method.';
            confidence = 0.84;
          }
          break;

        case 'card_declined':
          riskLevel = 'medium';
          diagnosis = 'Card decline response received from card issuing bank.';
          recoverable = true;
          recommendedAction = 'suggest_alternate_payment_method';
          reason = 'Card declined. High probability of recovery by suggesting UPI / NetBanking alternative payment method.';
          confidence = 0.87;
          break;

        case 'authentication_failed':
          riskLevel = 'medium';
          diagnosis = '3D-Secure / OTP verification timed out or was incorrectly entered.';
          recoverable = true;
          recommendedAction = 'send_checkout_link';
          reason = 'Authentication failure is often solved by issuing a fresh, pre-filled Razorpay payment link to customer.';
          confidence = 0.91;
          break;

        case 'expired_card':
          riskLevel = 'high';
          diagnosis = 'Stored credit/debit card details have expired.';
          recoverable = true;
          recommendedAction = 'suggest_alternate_payment_method';
          reason = 'Expired card cannot be retried. Customer needs to add updated card or switch to UPI AutoPay.';
          confidence = 0.96;
          break;

        case 'mandate_failed':
          riskLevel = 'high';
          diagnosis = 'Recurring e-Mandate debit failed at NPCI clearing gateway.';
          recoverable = true;
          recommendedAction = 'send_checkout_link';
          reason = 'Mandate processing failure. Sending instant direct checkout link to recover current invoice manually.';
          confidence = 0.88;
          break;

        case 'checkout_abandoned':
          riskLevel = 'low';
          diagnosis = 'Customer initiated checkout session but did not complete transaction.';
          recoverable = true;
          recommendedAction = 'send_payment_reminder';
          reason = 'High intent customer checkout dropoff. Gentle WhatsApp/Email payment reminder link recommended.';
          confidence = 0.90;
          break;

        default:
          riskLevel = 'medium';
          diagnosis = 'Unclassified payment failure event.';
          recoverable = true;
          recommendedAction = 'send_payment_reminder';
          reason = 'Standard recovery reminder issued for unclassified failure reason.';
          confidence = 0.75;
      }
    }

    const decision: AIDecision = {
      riskLevel,
      diagnosis,
      recoverable,
      recommendedAction,
      reason,
      confidence
    };

    return AIDecisionSchema.parse(decision);
  }
}
