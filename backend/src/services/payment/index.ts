import { PaymentGateway } from './PaymentGateway';
import { MockPaymentGateway } from './MockPaymentGateway';
import { RazorpayTestGateway } from './RazorpayTestGateway';

let gatewayInstance: PaymentGateway | null = null;

export function getPaymentGateway(): PaymentGateway {
  if (gatewayInstance) return gatewayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret && !keyId.includes('your-razorpay')) {
    console.log('💳 Initializing RazorpayTestGateway (Test Credentials found)');
    gatewayInstance = new RazorpayTestGateway(keyId, keySecret);
  } else {
    console.log('⚡ Initializing MockPaymentGateway (Default Sandbox Simulation Mode)');
    gatewayInstance = new MockPaymentGateway();
  }

  return gatewayInstance;
}
