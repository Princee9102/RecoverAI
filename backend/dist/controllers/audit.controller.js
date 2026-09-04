"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = void 0;
const prisma_1 = require("../database/prisma");
const getAuditLogs = async (req, res) => {
    try {
        const { eventType, search, limit = '100', page = '1' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (eventType && eventType !== 'all') {
            where.event_type = eventType;
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
            prisma_1.prisma.auditLog.findMany({
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
            prisma_1.prisma.auditLog.count({ where })
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
    }
};
exports.getAuditLogs = getAuditLogs;
