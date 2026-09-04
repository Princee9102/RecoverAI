"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failureDemo = exports.simulateBatch = exports.executeRecoveryAction = exports.analyzeTransaction = void 0;
const RecoveryOrchestrator_1 = require("../services/recovery/RecoveryOrchestrator");
const recovery_schema_1 = require("../schemas/recovery.schema");
const analyzeTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await RecoveryOrchestrator_1.RecoveryOrchestrator.analyzeTransaction(id);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'AI analysis failed', details: err.message });
    }
};
exports.analyzeTransaction = analyzeTransaction;
const executeRecoveryAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        let manualAction;
        if (action) {
            const parsed = recovery_schema_1.AllowedActionsSchema.safeParse(action);
            if (!parsed.success) {
                return res.status(400).json({ error: `Action '${action}' is not in allowed actions list.` });
            }
            manualAction = parsed.data;
        }
        const result = await RecoveryOrchestrator_1.RecoveryOrchestrator.executeRecoveryAction(id, manualAction);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Recovery action execution failed', details: err.message });
    }
};
exports.executeRecoveryAction = executeRecoveryAction;
const simulateBatch = async (req, res) => {
    try {
        const result = await RecoveryOrchestrator_1.RecoveryOrchestrator.simulateBatch();
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Batch simulation failed', details: err.message });
    }
};
exports.simulateBatch = simulateBatch;
const failureDemo = async (req, res) => {
    try {
        const result = await RecoveryOrchestrator_1.RecoveryOrchestrator.runFailureDemo();
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Failure demo execution failed', details: err.message });
    }
};
exports.failureDemo = failureDemo;
