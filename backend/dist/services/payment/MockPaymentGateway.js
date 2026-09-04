"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPaymentGateway = void 0;
class MockPaymentGateway {
    getGatewayName() {
        return 'MockPaymentGateway (Sandbox Simulation)';
    }
    isMock() {
        return true;
    }
    generateRef(prefix) {
        return `${prefix}_sim_${Math.random().toString(36).substring(2, 10)}`;
    }
    async executePaymentRetry(txn) {
        await new Promise((res) => setTimeout(res, 100));
        // Calculate realistic retry success rate based on failure reason
        let successRate = 0.5;
        if (txn.failure_reason === 'bank_timeout' || txn.failure_reason === 'network_error') {
            successRate = 0.85;
        }
        else if (txn.failure_reason === 'insufficient_funds') {
            successRate = 0.35;
        }
        else if (txn.failure_reason === 'card_declined' || txn.failure_reason === 'expired_card') {
            successRate = 0.15;
        }
        const isSuccess = Math.random() < successRate;
        if (isSuccess) {
            return {
                success: true,
                actionTaken: 'retry_payment',
                recoveredAmount: txn.amount,
                gatewayReference: this.generateRef('pay'),
                message: `Simulated payment retry succeeded via ${txn.payment_method.toUpperCase()}. ₹${txn.amount} recovered.`,
                status: 'recovered'
            };
        }
        else {
            return {
                success: false,
                actionTaken: 'retry_payment',
                recoveredAmount: 0,
                gatewayReference: this.generateRef('pay_fail'),
                message: `Payment retry failed: Issuing bank declined automated retry request (${txn.failure_reason}).`,
                status: 'failed'
            };
        }
    }
    async scheduleRetry(txn) {
        await new Promise((res) => setTimeout(res, 80));
        return {
            success: true,
            actionTaken: 'schedule_retry',
            recoveredAmount: 0,
            gatewayReference: this.generateRef('sched'),
            message: `Retry workflow scheduled for execution in 2 hours for ${txn.transaction_id}.`,
            status: 'scheduled'
        };
    }
    async sendPaymentReminder(txn) {
        await new Promise((res) => setTimeout(res, 80));
        const isConverted = Math.random() < 0.72;
        if (isConverted) {
            return {
                success: true,
                actionTaken: 'send_payment_reminder',
                recoveredAmount: txn.amount,
                gatewayReference: this.generateRef('remind_success'),
                message: `Customer clicked WhatsApp/Email payment reminder and completed payment of ₹${txn.amount}.`,
                status: 'recovered'
            };
        }
        else {
            return {
                success: false,
                actionTaken: 'send_payment_reminder',
                recoveredAmount: 0,
                gatewayReference: this.generateRef('remind_sent'),
                message: `Payment reminder sent to ${txn.customer_email}. Awaiting customer response.`,
                status: 'communication_sent'
            };
        }
    }
    async suggestAlternatePaymentMethod(txn) {
        await new Promise((res) => setTimeout(res, 80));
        const isConverted = Math.random() < 0.78;
        if (isConverted) {
            return {
                success: true,
                actionTaken: 'suggest_alternate_payment_method',
                recoveredAmount: txn.amount,
                gatewayReference: this.generateRef('alt_pay_success'),
                message: `Customer switched payment method from ${txn.payment_method} to UPI and successfully recovered ₹${txn.amount}.`,
                status: 'recovered'
            };
        }
        else {
            return {
                success: false,
                actionTaken: 'suggest_alternate_payment_method',
                recoveredAmount: 0,
                gatewayReference: this.generateRef('alt_pay_sent'),
                message: `Alternate payment method invitation sent to ${txn.customer_email}.`,
                status: 'communication_sent'
            };
        }
    }
    async sendCheckoutLink(txn) {
        await new Promise((res) => setTimeout(res, 80));
        const isConverted = Math.random() < 0.81;
        if (isConverted) {
            return {
                success: true,
                actionTaken: 'send_checkout_link',
                recoveredAmount: txn.amount,
                gatewayReference: this.generateRef('link_success'),
                message: `Direct Razorpay payment link paid by ${txn.customer_name}. ₹${txn.amount} recovered.`,
                status: 'recovered'
            };
        }
        else {
            return {
                success: false,
                actionTaken: 'send_checkout_link',
                recoveredAmount: 0,
                gatewayReference: this.generateRef('link_sent'),
                message: `Fresh payment checkout link generated: https://rzp.io/l/${this.generateRef('chk')}. Sent to customer.`,
                status: 'communication_sent'
            };
        }
    }
}
exports.MockPaymentGateway = MockPaymentGateway;
