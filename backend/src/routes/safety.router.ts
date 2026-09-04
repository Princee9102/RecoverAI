import { Router } from 'express';
import { getSafetyRules } from '../controllers/safety.controller';

const router = Router();
router.get('/', getSafetyRules);

export default router;
