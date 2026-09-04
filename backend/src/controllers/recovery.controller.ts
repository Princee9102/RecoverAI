import { Request, Response } from 'express';
import { RecoveryOrchestrator } from '../services/recovery/RecoveryOrchestrator';
import { AllowedActionsSchema } from '../schemas/recovery.schema';

export const analyzeTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await RecoveryOrchestrator.analyzeTransaction(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'AI analysis failed', details: (err as Error).message });
  }
};

export const executeRecoveryAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    let manualAction;
    if (action) {
      const parsed = AllowedActionsSchema.safeParse(action);
      if (!parsed.success) {
        return res.status(400).json({ error: `Action '${action}' is not in allowed actions list.` });
      }
      manualAction = parsed.data;
    }

    const result = await RecoveryOrchestrator.executeRecoveryAction(id, manualAction);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Recovery action execution failed', details: (err as Error).message });
  }
};

export const simulateBatch = async (req: Request, res: Response) => {
  try {
    const result = await RecoveryOrchestrator.simulateBatch();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Batch simulation failed', details: (err as Error).message });
  }
};

export const failureDemo = async (req: Request, res: Response) => {
  try {
    const result = await RecoveryOrchestrator.runFailureDemo();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failure demo execution failed', details: (err as Error).message });
  }
};
