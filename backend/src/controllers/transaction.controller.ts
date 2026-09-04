import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import { exec } from 'child_process';
import path from 'path';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { search, status, limit = '100', page = '1' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status && status !== 'all') {
      where.recovery_status = status as string;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { transaction_id: { contains: q } },
        { customer_name: { contains: q } },
        { customer_id: { contains: q } },
        { failure_reason: { contains: q } },
        { payment_method: { contains: q } }
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions', details: (err as Error).message });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const txn = await prisma.transaction.findFirst({
      where: {
        OR: [
          { id },
          { transaction_id: id }
        ]
      },
      include: {
        recovery_actions: { orderBy: { executed_at: 'desc' } },
        audit_logs: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Build timeline events
    const timeline = [
      {
        timestamp: txn.created_at,
        title: 'Payment Failed',
        description: `Initial payment of ₹${txn.amount} via ${txn.payment_method.toUpperCase()} failed due to ${txn.failure_reason.replace('_', ' ')}.`,
        type: 'failure'
      }
    ];

    if (txn.ai_diagnosis) {
      timeline.push({
        timestamp: txn.updated_at,
        title: 'AI Recovery Assessment',
        description: `Diagnosis: ${txn.ai_diagnosis} | Recommended Action: ${txn.recovery_action} (Confidence: ${Math.round((txn.ai_confidence || 0.9) * 100)}%)`,
        type: 'ai'
      });
    }

    for (const action of txn.recovery_actions) {
      timeline.push({
        timestamp: action.executed_at,
        title: `Executed: ${action.action_type.replace(/_/g, ' ').toUpperCase()}`,
        description: `Status: ${action.status.toUpperCase()} (Gateway Ref: ${action.gateway_response || 'N/A'})`,
        type: action.status === 'success' ? 'success' : 'action'
      });
    }

    if (txn.recovery_status === 'recovered') {
      timeline.push({
        timestamp: txn.updated_at,
        title: 'Payment Recovered',
        description: `₹${txn.recovered_amount} recovered successfully. Recovery workflow completed and stopped.`,
        type: 'success'
      });
    } else if (txn.recovery_status === 'escalated') {
      timeline.push({
        timestamp: txn.updated_at,
        title: 'Escalated to Human Operations',
        description: 'Automated retry limits reached. Ticket created for manual account manager review.',
        type: 'escalated'
      });
    }

    res.json({
      transaction: txn,
      timeline
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction details', details: (err as Error).message });
  }
};

export const generateTransactions = async (req: Request, res: Response) => {
  try {
    const seedScript = path.join(__dirname, '../../prisma/seed.ts');
    exec(`npx ts-node "${seedScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error running seed:', error);
        return res.status(500).json({ error: 'Failed to generate dataset', details: stderr || error.message });
      }
      res.json({ message: 'Synthetic transaction dataset re-generated successfully', log: stdout });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger seed script', details: (err as Error).message });
  }
};
