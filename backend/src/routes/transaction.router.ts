import { Router } from 'express';
import { getTransactions, getTransactionById, generateTransactions } from '../controllers/transaction.controller';

const router = Router();
router.get('/', getTransactions);
router.post('/generate', generateTransactions);
router.get('/:id', getTransactionById);

export default router;
