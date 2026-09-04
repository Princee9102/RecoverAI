"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = void 0;
const prisma_1 = require("../database/prisma");
const getDashboardMetrics = async (req, res) => {
    try {
        const totalTransactions = await prisma_1.prisma.transaction.count();
        const revenueAtRiskAgg = await prisma_1.prisma.transaction.aggregate({
            _sum: { amount: true }
        });
        const revenueAtRisk = revenueAtRiskAgg._sum.amount || 0;
        const recoverableAgg = await prisma_1.prisma.transaction.aggregate({
            where: { recovery_status: { in: ['recoverable', 'recovering', 'recovered'] } },
            _sum: { amount: true }
        });
        const recoverableRevenue = recoverableAgg._sum.amount || 0;
        const recoveredAgg = await prisma_1.prisma.transaction.aggregate({
            where: { recovery_status: 'recovered' },
            _sum: { recovered_amount: true }
        });
        const recoveredRevenue = recoveredAgg._sum.recovered_amount || 0;
        const recoveredCount = await prisma_1.prisma.transaction.count({
            where: { recovery_status: 'recovered' }
        });
        const recoverableCount = await prisma_1.prisma.transaction.count({
            where: { recovery_status: { in: ['recoverable', 'recovering', 'recovered'] } }
        });
        const humanEscalations = await prisma_1.prisma.transaction.count({
            where: { recovery_status: 'escalated' }
        });
        const recoveryRate = recoverableCount > 0 ? parseFloat(((recoveredCount / recoverableCount) * 100).toFixed(1)) : 0;
        // Charts Data
        // 1. Recovery Rate by Failure Reason
        const failureReasons = [
            'insufficient_funds', 'card_declined', 'bank_timeout',
            'authentication_failed', 'expired_card', 'network_error',
            'mandate_failed', 'checkout_abandoned'
        ];
        const failureReasonBreakdown = await Promise.all(failureReasons.map(async (reason) => {
            const total = await prisma_1.prisma.transaction.count({ where: { failure_reason: reason } });
            const recovered = await prisma_1.prisma.transaction.count({ where: { failure_reason: reason, recovery_status: 'recovered' } });
            const rate = total > 0 ? Math.round((recovered / total) * 100) : 0;
            return {
                reason: reason.replace('_', ' ').toUpperCase(),
                total,
                recovered,
                rate
            };
        }));
        // 2. Transactions by Recovery Status
        const statuses = ['at_risk', 'recoverable', 'recovering', 'recovered', 'escalated', 'unrecoverable'];
        const statusDistribution = await Promise.all(statuses.map(async (status) => {
            const count = await prisma_1.prisma.transaction.count({ where: { recovery_status: status } });
            return {
                status: status.replace('_', ' ').toUpperCase(),
                count
            };
        }));
        // 3. Recovery Actions Distribution
        const actions = [
            'retry_payment', 'schedule_retry', 'send_payment_reminder',
            'suggest_alternate_payment_method', 'send_checkout_link', 'escalate_to_human', 'stop_recovery'
        ];
        const actionDistribution = await Promise.all(actions.map(async (action) => {
            const count = await prisma_1.prisma.transaction.count({ where: { recovery_action: action } });
            return {
                action: action.replace(/_/g, ' ').toUpperCase(),
                count
            };
        }));
        res.json({
            metrics: {
                totalTransactions,
                revenueAtRisk,
                recoverableRevenue,
                recoveredRevenue,
                recoveryRate,
                humanEscalations,
                recoveredCount,
                recoverableCount
            },
            charts: {
                failureReasonBreakdown,
                statusDistribution,
                actionDistribution
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to calculate dashboard metrics', details: err.message });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
