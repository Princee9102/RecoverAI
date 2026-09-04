import Razorpay from 'razorpay';
import { PaymentGateway, PaymentExecutionResult } from './PaymentGateway';
import { MockPaymentGateway } from './MockPaymentGateway';
import { Transaction } from '@prisma/client';

export class RazorpayTestGateway implements PaymentGateway {
  private razorpay: any;
  private fallbackMock: MockPaymentGateway;

  constructor(keyId: string, keySecret: string) {
    this.razorpay = new (Razorpay as any)({
      key_id: keyId,
      key_secret: keySecret
    });
    this.fallbackMock = new MockPaymentGateway();
  }

  getGatewayName(): string {
    return 'RazorpayTestGateway (Test Mode Credentials)';
  }

  isMock(): boolean {
    return false;
  }

  async executePaymentRetry(txn: Transaction): Promise<PaymentExecutionResult> {
    try {
      // In Razorpay Test Mode, create a test order stub
      const order = await this.razorpay.orders.create({
        amount: Math.round(txn.amount * 100), // amount in paise
        currency: 'INR',
        receipt: `rcpt_${txn.transaction_id}`,
        notes: {
          transaction_id: txn.transaction_id,
          customer_id: txn.customer_id,
          recovery_agent: 'RecoverAI'
        }
      });

      return {
        success: true,
        actionTaken: 'retry_payment',
        recoveredAmount: txn.amount,
        gatewayReference: order.id,
        message: `Razorpay Test Mode Order created (${order.id}). Simulated test recovery completed for ₹${txn.amount}.`,
        status: 'recovered'
      };
    } catch (err) {
      console.warn('⚠️ Razorpay Test Gateway order creation failed. Using mock sandbox:', (err as Error).message);
      return this.fallbackMock.executePaymentRetry(txn);
    }
  }

  async scheduleRetry(txn: Transaction): Promise<PaymentExecutionResult> {
    return this.fallbackMock.scheduleRetry(txn);
  }

  async sendPaymentReminder(txn: Transaction): Promise<PaymentExecutionResult> {
    return this.fallbackMock.sendPaymentReminder(txn);
  }

  async suggestAlternatePaymentMethod(txn: Transaction): Promise<PaymentExecutionResult> {
    return this.fallbackMock.suggestAlternatePaymentMethod(txn);
  }

  async sendCheckoutLink(txn: Transaction): Promise<PaymentExecutionResult> {
    try {
      // Use Razorpay Payment Links API (test mode)
      const linkPayload: any = {
        amount: Math.round(txn.amount * 100),
        currency: 'INR',
        accept_partial: false,
        description: `Payment Recovery Link for ${txn.transaction_id}`,
        customer: {
          name: txn.customer_name,
          email: txn.customer_email
        },
        notify: {
          sms: false,
          email: true
        },
        reminder_enable: true,
        notes: {
          transaction_id: txn.transaction_id,
          recovery_agent: 'RecoverAI'
        }
      };

      let link: any;
      // Try the paymentLink API if available, otherwise fall back
      if (this.razorpay.paymentLink && typeof this.razorpay.paymentLink.create === 'function') {
        link = await this.razorpay.paymentLink.create(linkPayload);
      } else {
        // Fallback: use invoices API or mock
        console.warn('⚠️ Razorpay paymentLink API not available on this SDK version. Using mock fallback.');
        return this.fallbackMock.sendCheckoutLink(txn);
      }

      return {
        success: true,
        actionTaken: 'send_checkout_link',
        recoveredAmount: 0,
        gatewayReference: link.id,
        message: `Razorpay Payment Link generated: ${link.short_url || 'https://rzp.io/test'}. Sent to ${txn.customer_email}.`,
        status: 'communication_sent'
      };
    } catch (err) {
      console.warn('⚠️ Razorpay checkout link creation failed. Using mock fallback:', (err as Error).message);
      return this.fallbackMock.sendCheckoutLink(txn);
    }
  }
}
