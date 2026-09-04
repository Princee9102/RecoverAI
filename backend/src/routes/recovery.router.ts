import { Router } from 'express';
import {
  analyzeTransaction,
  executeRecoveryAction,
  simulateBatch,
  failureDemo
} from '../controllers/recovery.controller';

const router = Router();

router.post('/analyze/:id', analyzeTransaction);
router.post('/execute/:id', executeRecoveryAction);
router.post('/simulate', simulateBatch);
router.post('/failure-demo', failureDemo);

export default router;
