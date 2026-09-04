"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentGateway = getPaymentGateway;
const MockPaymentGateway_1 = require("./MockPaymentGateway");
const RazorpayTestGateway_1 = require("./RazorpayTestGateway");
let gatewayInstance = null;
function getPaymentGateway() {
    if (gatewayInstance)
        return gatewayInstance;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret && !keyId.includes('your-razorpay')) {
        console.log('💳 Initializing RazorpayTestGateway (Test Credentials found)');
        gatewayInstance = new RazorpayTestGateway_1.RazorpayTestGateway(keyId, keySecret);
    }
    else {
        console.log('⚡ Initializing MockPaymentGateway (Default Sandbox Simulation Mode)');
        gatewayInstance = new MockPaymentGateway_1.MockPaymentGateway();
    }
    return gatewayInstance;
}
