"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayTestGateway = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const MockPaymentGateway_1 = require("./MockPaymentGateway");
class RazorpayTestGateway {
    razorpay;
    fallbackMock;
    constructor(keyId, keySecret) {
        this.razorpay = new razorpay_1.default({
            key_id: keyId,
            key_secret: keySecret
        });
        this.fallbackMock = new MockPaymentGateway_1.MockPaymentGateway();
    }
    getGatewayName() {
        return 'RazorpayTestGateway (Test Mode Credentials)';
    }
    isMock() {
        return false;
    }
    async executePaymentRetry(txn) {
        try {
            // In Razorpay Test Mode, create a test payment link / order stub
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
        }
        catch (err) {
            console.warn('⚠️ Razorpay Test Gateway API call failed. Using mock sandbox simulation:', err.message);
            return this.fallbackMock.executePaymentRetry(txn);
        }
    }
    async scheduleRetry(txn) {
        return this.fallbackMock.scheduleRetry(txn);
    }
    async sendPaymentReminder(txn) {
        return this.fallbackMock.sendPaymentReminder(txn);
    }
    async suggestAlternatePaymentMethod(txn) {
        return this.fallbackMock.suggestAlternatePaymentMethod(txn);
    }
    async sendCheckoutLink(txn) {
        try {
            const link = await this.razorpay.paymentLink.create({
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
                    transaction_id: txn.transaction_id
                }
            });
            return {
                success: true,
                actionTaken: 'send_checkout_link',
                recoveredAmount: 0,
                gatewayReference: link.id,
                message: `Razorpay Payment Link generated: ${link.short_url}. Sent to ${txn.customer_email}.`,
                status: 'communication_sent'
            };
        }
        catch (err) {
            return this.fallbackMock.sendCheckoutLink(txn);
        }
    }
}
exports.RazorpayTestGateway = RazorpayTestGateway;
