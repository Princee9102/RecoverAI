import { z } from 'zod';

export const AllowedActionsSchema = z.enum([
  'retry_payment',
  'schedule_retry',
  'send_payment_reminder',
  'suggest_alternate_payment_method',
  'send_checkout_link',
  'escalate_to_human',
  'stop_recovery'
]);

export type AllowedAction = z.infer<typeof AllowedActionsSchema>;

export const AIDecisionSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high']),
  diagnosis: z.string().min(3),
  recoverable: z.boolean(),
  recommendedAction: AllowedActionsSchema,
  reason: z.string().min(5),
  confidence: z.number().min(0.0).max(1.0)
});

export type AIDecision = z.infer<typeof AIDecisionSchema>;

export const ExecuteActionRequestSchema = z.object({
  action: AllowedActionsSchema.optional(),
  overrideReason: z.string().optional()
});
