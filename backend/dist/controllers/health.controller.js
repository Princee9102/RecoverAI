"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = void 0;
const ai_1 = require("../services/ai");
const payment_1 = require("../services/payment");
const getHealth = async (req, res) => {
    const aiService = (0, ai_1.getAIService)();
    const paymentGateway = (0, payment_1.getPaymentGateway)();
    const isDemoAI = aiService.getServiceName().includes('DemoAIService');
    const isMockGateway = paymentGateway.isMock();
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        mode: isDemoAI || isMockGateway ? 'DEMO MODE' : 'LIVE TEST MODE',
        aiService: aiService.getServiceName(),
        paymentGateway: paymentGateway.getGatewayName(),
        isDemoAI,
        isMockGateway
    });
};
exports.getHealth = getHealth;
