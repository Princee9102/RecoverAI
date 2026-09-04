"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const DemoAIService_1 = require("./DemoAIService");
const recovery_schema_1 = require("../../schemas/recovery.schema");
class OpenAIService {
    openai;
    fallbackService;
    constructor(apiKey) {
        this.openai = new openai_1.default({ apiKey });
        this.fallbackService = new DemoAIService_1.DemoAIService();
    }
    getServiceName() {
        return 'OpenAIService (GPT Structured JSON Output)';
    }
    async diagnoseAndRecommend(txn) {
        try {
            const prompt = `
You are RecoverAI, an expert fintech payment recovery AI agent for Indian merchants.
Analyze the following failed transaction and determine:
1. Cause of failure and diagnosis
2. Risk level (low, medium, high)
3. Recoverability (boolean)
4. Recommended recovery action (MUST be strictly one of: "retry_payment", "schedule_retry", "send_payment_reminder", "suggest_alternate_payment_method", "send_checkout_link", "escalate_to_human", "stop_recovery")
5. Short explanation reason (1-2 sentences)
6. Confidence score (0.0 to 1.0)

Transaction Details:
- ID: ${txn.transaction_id}
- Customer ID: ${txn.customer_id}
- Amount: ₹${txn.amount}
- Payment Method: ${txn.payment_method}
- Failure Reason: ${txn.failure_reason}
- Attempt Number: ${txn.attempt_number}
- Previous Recovery Attempts: ${txn.recovery_attempts}
- Communication Attempts: ${txn.communication_attempts}
- Customer Segment: ${txn.customer_segment}
- Subscription Status: ${txn.subscription_status}
- Historical Success Rate: ${(txn.previous_success_rate * 100).toFixed(1)}%
- Days Since Last Payment: ${txn.days_since_last_payment}

Return strict JSON only matching this format:
{
  "riskLevel": "low" | "medium" | "high",
  "diagnosis": "string",
  "recoverable": true | false,
  "recommendedAction": "retry_payment" | "schedule_retry" | "send_payment_reminder" | "suggest_alternate_payment_method" | "send_checkout_link" | "escalate_to_human" | "stop_recovery",
  "reason": "string",
  "confidence": number
}
`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.2
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('Empty response from OpenAI');
            }
            const parsed = JSON.parse(content);
            return recovery_schema_1.AIDecisionSchema.parse(parsed);
        }
        catch (err) {
            console.warn('⚠️ OpenAI API call failed or schema invalid. Falling back to DemoAIService:', err.message);
            return this.fallbackService.diagnoseAndRecommend(txn);
        }
    }
}
exports.OpenAIService = OpenAIService;
