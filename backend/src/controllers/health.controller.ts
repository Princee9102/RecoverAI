import { Request, Response } from 'express';
import { getAIService } from '../services/ai';
import { getPaymentGateway } from '../services/payment';

export const getHealth = async (req: Request, res: Response) => {
  const aiService = getAIService();
  const paymentGateway = getPaymentGateway();

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
