import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import healthRouter from './routes/health.router';
import dashboardRouter from './routes/dashboard.router';
import transactionRouter from './routes/transaction.router';
import recoveryRouter from './routes/recovery.router';
import analyticsRouter from './routes/analytics.router';
import auditRouter from './routes/audit.router';
import safetyRouter from './routes/safety.router';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/recovery', recoveryRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/audit-logs', auditRouter);
app.use('/api/safety-rules', safetyRouter);

// Centralized Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Unhandled Error:', err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

export default app;
