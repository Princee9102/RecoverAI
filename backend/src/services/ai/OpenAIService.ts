import OpenAI from 'openai';
import { AIService } from './AIService';
import { DemoAIService } from './DemoAIService';
import { AIDecision, AIDecisionSchema } from '../../schemas/recovery.schema';
import { Transaction } from '@prisma/client';

export class OpenAIService implements AIService {
  private openai: OpenAI;
  private fallbackService: DemoAIService;
  private permanentlyFallback: boolean = false;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.fallbackService = new DemoAIService();
  }

  getServiceName(): string {
    if (this.permanentlyFallback) {
      return 'DemoAIService (OpenAI key present but no credits — automatic fallback)';
    }
    return 'OpenAIService (GPT Structured JSON Output)';
  }

  async diagnoseAndRecommend(txn: Transaction): Promise<AIDecision> {
    // If we already know the key has no credits, skip the API call entirely
    if (this.permanentlyFallback) {
      return this.fallbackService.diagnoseAndRecommend(txn);
    }

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
      return AIDecisionSchema.parse(parsed);
    } catch (err) {
      const errMsg = (err as Error).message || '';

      // If 429 / no credits / quota exceeded, switch permanently to avoid spamming
      if (errMsg.includes('429') || errMsg.includes('no credits') || errMsg.includes('quota') || errMsg.includes('billing')) {
        console.warn('⚠️ OpenAI API has no remaining credits. Permanently switching to DemoAIService for this session.');
        this.permanentlyFallback = true;
      } else {
        console.warn('⚠️ OpenAI API call failed. Falling back to DemoAIService:', errMsg);
      }

      return this.fallbackService.diagnoseAndRecommend(txn);
    }
  }
}
