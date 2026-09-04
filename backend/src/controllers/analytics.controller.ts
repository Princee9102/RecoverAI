import { Request, Response } from 'express';
import { prisma } from '../database/prisma';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const totalTransactions = await prisma.transaction.count();
    const recoveredCount = await prisma.transaction.count({ where: { recovery_status: 'recovered' } });
    const escalatedCount = await prisma.transaction.count({ where: { recovery_status: 'escalated' } });
    const failedCount = await prisma.transaction.count({ where: { recovery_status: { in: ['failed', 'unrecoverable'] } } });

    const totalAtRiskRevenue = (await prisma.transaction.aggregate({ _sum: { amount: true } }))._sum.amount || 0;
    const totalRecoveredRevenue = (await prisma.transaction.aggregate({ where: { recovery_status: 'recovered' }, _sum: { recovered_amount: true } }))._sum.recovered_amount || 0;

    const avgRecoveryAmount = recoveredCount > 0 ? parseFloat((totalRecoveredRevenue / recoveredCount).toFixed(2)) : 0;
    const recoveryRate = totalTransactions > 0 ? parseFloat(((recoveredCount / totalTransactions) * 100).toFixed(1)) : 0;
    const escalationRate = totalTransactions > 0 ? parseFloat(((escalatedCount / totalTransactions) * 100).toFixed(1)) : 0;

    // Segment Breakdown
    const segments = ['Enterprise', 'SMB', 'Startup', 'Consumer'];
    const segmentPerformance = await Promise.all(
      segments.map(async (segment) => {
        const total = await prisma.transaction.count({ where: { customer_segment: segment } });
        const recovered = await prisma.transaction.count({ where: { customer_segment: segment, recovery_status: 'recovered' } });
        const revenueAtRisk = (await prisma.transaction.aggregate({ where: { customer_segment: segment }, _sum: { amount: true } }))._sum.amount || 0;
        const revenueRecovered = (await prisma.transaction.aggregate({ where: { customer_segment: segment, recovery_status: 'recovered' }, _sum: { recovered_amount: true } }))._sum.recovered_amount || 0;

        return {
          segment,
          total,
          recovered,
          rate: total > 0 ? parseFloat(((recovered / total) * 100).toFixed(1)) : 0,
          revenueAtRisk,
          revenueRecovered
        };
      })
    );

    // Recent Simulation Runs
    const simulationRuns = await prisma.simulationRun.findMany({
      orderBy: { run_at: 'desc' },
      take: 5
    });

    res.json({
      summary: {
        totalTransactions,
        recoveredCount,
        escalatedCount,
        failedCount,
        totalAtRiskRevenue,
        totalRecoveredRevenue,
        avgRecoveryAmount,
        recoveryRate,
        escalationRate
      },
      segmentPerformance,
      simulationRuns
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: (err as Error).message });
  }
};
