import { AIDecision } from '../../schemas/recovery.schema';
import { Transaction } from '@prisma/client';

export interface AIService {
  diagnoseAndRecommend(transaction: Transaction): Promise<AIDecision>;
  getServiceName(): string;
}
