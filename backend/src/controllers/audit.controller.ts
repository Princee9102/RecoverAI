import { Request, Response } from 'express';
import { prisma } from '../database/prisma';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { eventType, search, limit = '100', page = '1' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (eventType && eventType !== 'all') {
      where.event_type = eventType as string;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { transaction_id: { contains: q } },
        { decision: { contains: q } },
        { reason: { contains: q } },
        { action: { contains: q } },
        { result: { contains: q } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limitNum,
        include: {
          transaction: {
            select: {
              customer_name: true,
              amount: true,
              payment_method: true,
              failure_reason: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: (err as Error).message });
  }
};
