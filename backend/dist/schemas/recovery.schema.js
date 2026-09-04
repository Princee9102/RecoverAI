"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteActionRequestSchema = exports.AIDecisionSchema = exports.AllowedActionsSchema = void 0;
const zod_1 = require("zod");
exports.AllowedActionsSchema = zod_1.z.enum([
    'retry_payment',
    'schedule_retry',
    'send_payment_reminder',
    'suggest_alternate_payment_method',
    'send_checkout_link',
    'escalate_to_human',
    'stop_recovery'
]);
exports.AIDecisionSchema = zod_1.z.object({
    riskLevel: zod_1.z.enum(['low', 'medium', 'high']),
    diagnosis: zod_1.z.string().min(3),
    recoverable: zod_1.z.boolean(),
    recommendedAction: exports.AllowedActionsSchema,
    reason: zod_1.z.string().min(5),
    confidence: zod_1.z.number().min(0.0).max(1.0)
});
exports.ExecuteActionRequestSchema = zod_1.z.object({
    action: exports.AllowedActionsSchema.optional(),
    overrideReason: zod_1.z.string().optional()
});
