"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSafetyRules = void 0;
const prisma_1 = require("../database/prisma");
const getSafetyRules = async (req, res) => {
    try {
        const rules = await prisma_1.prisma.safetyRule.findMany({
            orderBy: { rule_key: 'asc' }
        });
        const allowedActions = [
            { action: 'retry_payment', description: 'Re-submit payment attempt to issuing bank', maxLimit: '2 attempts' },
            { action: 'schedule_retry', description: 'Schedule delayed retry during optimal bank window', maxLimit: '2 attempts' },
            { action: 'send_payment_reminder', description: 'Dispatch WhatsApp/Email reminder link', maxLimit: '3 communications' },
            { action: 'suggest_alternate_payment_method', description: 'Invite customer to switch to UPI/NetBanking', maxLimit: '3 communications' },
            { action: 'send_checkout_link', description: 'Issue fresh, pre-filled Razorpay Checkout link', maxLimit: '3 communications' },
            { action: 'escalate_to_human', description: 'Transfer ticket to human Operations & CS team', maxLimit: 'Unbounded' },
            { action: 'stop_recovery', description: 'Halt workflow immediately', maxLimit: 'Triggered on opt-out / recovery' }
        ];
        res.json({
            rules,
            allowedActions,
            policyNotice: 'AI proposes decisions based on transaction context. Deterministic policy rules in backend code decide whether those decisions are authorized to execute.'
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch safety rules', details: err.message });
    }
};
exports.getSafetyRules = getSafetyRules;
