"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecoveryOrchestrator = void 0;
const prisma_1 = require("../../database/prisma");
const ai_1 = require("../ai");
const payment_1 = require("../payment");
const SafetyPolicyGate_1 = require("./SafetyPolicyGate");
const EligibilityEngine_1 = require("./EligibilityEngine");
class RecoveryOrchestrator {
    static async analyzeTransaction(transactionId) {
        const txn = await prisma_1.prisma.transaction.findUnique({
            where: { transaction_id: transactionId }
        });
        if (!txn) {
            throw new Error(`Transaction ${transactionId} not found`);
        }
        const aiService = (0, ai_1.getAIService)();
        const aiDecision = await aiService.diagnoseAndRecommend(txn);
        const eligibility = EligibilityEngine_1.EligibilityEngine.evaluateEligibility(txn);
        const recoveryStatus = eligibility.isEligible ? 'recoverable' : (txn.recovery_status === 'at_risk' ? 'unrecoverable' : txn.recovery_status);
        const updatedTxn = await prisma_1.prisma.transaction.update({
            where: { transaction_id: transactionId },
            data: {
                ai_diagnosis: aiDecision.diagnosis,
                ai_explanation: aiDecision.reason,
                ai_confidence: aiDecision.confidence,
                risk_level: aiDecision.riskLevel,
                recovery_action: aiDecision.recommendedAction,
                recovery_status: recoveryStatus
            }
        });
        // Record Audit Log for Diagnosis
        await prisma_1.prisma.auditLog.create({
            data: {
                transaction_id: transactionId,
                event_type: 'DIAGNOSIS',
                decision: aiDecision.recommendedAction,
                reason: aiDecision.reason,
                confidence: aiDecision.confidence,
                action: 'AI_DIAGNOSIS_COMPLETED',
                result: `Diagnosed: ${aiDecision.diagnosis} (Risk: ${aiDecision.riskLevel.toUpperCase()}, Recoverable: ${aiDecision.recoverable})`
            }
        });
        return {
            transaction: updatedTxn,
            aiDecision,
            eligibility
        };
    }
    static async executeRecoveryAction(transactionId, manualActionOverride) {
        let txn = await prisma_1.prisma.transaction.findUnique({
            where: { transaction_id: transactionId }
        });
        if (!txn) {
            throw new Error(`Transaction ${transactionId} not found`);
        }
        // Ensure AI analysis has run
        if (!txn.recovery_action) {
            const analysis = await this.analyzeTransaction(transactionId);
            txn = analysis.transaction;
        }
        const actionToEvaluate = manualActionOverride || txn.recovery_action || 'schedule_retry';
        // 1. Safety Policy Gate Check
        const safetyCheck = SafetyPolicyGate_1.SafetyPolicyGate.evaluate(txn, actionToEvaluate);
        await prisma_1.prisma.auditLog.create({
            data: {
                transaction_id: transactionId,
                event_type: 'SAFETY_GATE_CHECK',
                decision: actionToEvaluate,
                reason: safetyCheck.policyReason,
                confidence: 1.0,
                action: 'POLICY_GATE_EVALUATION',
                result: safetyCheck.isAllowed ? 'PASSED' : `BLOCKED (${safetyCheck.ruleTriggered})`
            }
        });
        const finalAction = safetyCheck.actionToExecute;
        // Handle Human Escalation or Stop Workflow directly
        if (finalAction === 'escalate_to_human') {
            const updated = await prisma_1.prisma.transaction.update({
                where: { transaction_id: transactionId },
                data: { recovery_status: 'escalated' }
            });
            await prisma_1.prisma.auditLog.create({
                data: {
                    transaction_id: transactionId,
                    event_type: 'HUMAN_ESCALATION',
                    decision: 'escalate_to_human',
                    reason: safetyCheck.policyReason,
                    confidence: 1.0,
                    action: 'ESCALATE_TO_HUMAN',
                    result: 'Ticket assigned to Operations Team'
                }
            });
            return {
                transaction: updated,
                actionTaken: 'escalate_to_human',
                status: 'escalated',
                message: safetyCheck.policyReason
            };
        }
        if (finalAction === 'stop_recovery') {
            const updated = await prisma_1.prisma.transaction.update({
                where: { transaction_id: transactionId },
                data: { recovery_status: 'unrecoverable' }
            });
            await prisma_1.prisma.auditLog.create({
                data: {
                    transaction_id: transactionId,
                    event_type: 'STOP_WORKFLOW',
                    decision: 'stop_recovery',
                    reason: safetyCheck.policyReason,
                    confidence: 1.0,
                    action: 'HALT_RECOVERY',
                    result: 'Recovery workflow terminated'
                }
            });
            return {
                transaction: updated,
                actionTaken: 'stop_recovery',
                status: 'stopped',
                message: safetyCheck.policyReason
            };
        }
        // Execute Payment Sandbox Action via Gateway Abstraction
        const gateway = (0, payment_1.getPaymentGateway)();
        let execResult;
        if (finalAction === 'retry_payment') {
            execResult = await gateway.executePaymentRetry(txn);
        }
        else if (finalAction === 'schedule_retry') {
            execResult = await gateway.scheduleRetry(txn);
        }
        else if (finalAction === 'send_payment_reminder') {
            execResult = await gateway.sendPaymentReminder(txn);
        }
        else if (finalAction === 'suggest_alternate_payment_method') {
            execResult = await gateway.suggestAlternatePaymentMethod(txn);
        }
        else if (finalAction === 'send_checkout_link') {
            execResult = await gateway.sendCheckoutLink(txn);
        }
        else {
            execResult = await gateway.sendPaymentReminder(txn);
        }
        // Calculate updated counters
        const isPaymentRetry = finalAction === 'retry_payment';
        const isComm = ['send_payment_reminder', 'suggest_alternate_payment_method', 'send_checkout_link'].includes(finalAction);
        const newRecoveryAttempts = txn.recovery_attempts + (isPaymentRetry ? 1 : 0);
        const newCommAttempts = txn.communication_attempts + (isComm ? 1 : 0);
        let newStatus = txn.recovery_status;
        let recoveredAmt = txn.recovered_amount;
        if (execResult.status === 'recovered') {
            newStatus = 'recovered';
            recoveredAmt = execResult.recoveredAmount;
        }
        else if (execResult.status === 'failed') {
            if (newRecoveryAttempts >= 2) {
                newStatus = 'escalated';
            }
            else {
                newStatus = 'recovering';
            }
        }
        else if (execResult.status === 'scheduled' || execResult.status === 'communication_sent') {
            newStatus = 'recovering';
        }
        const updatedTxn = await prisma_1.prisma.transaction.update({
            where: { transaction_id: transactionId },
            data: {
                recovery_status: newStatus,
                recovered_amount: recoveredAmt,
                recovery_attempts: newRecoveryAttempts,
                communication_attempts: newCommAttempts,
                invoice_status: execResult.status === 'recovered' ? 'paid' : txn.invoice_status
            }
        });
        // Record Action in RecoveryAction Table
        await prisma_1.prisma.recoveryAction.create({
            data: {
                transaction_id: transactionId,
                action_type: finalAction,
                status: execResult.success ? 'success' : 'failed',
                attempt_number: isPaymentRetry ? newRecoveryAttempts : newCommAttempts,
                gateway_response: execResult.gatewayReference || 'simulated',
                error_message: execResult.success ? null : execResult.message
            }
        });
        // Record Audit Log
        await prisma_1.prisma.auditLog.create({
            data: {
                transaction_id: transactionId,
                event_type: 'RECOVERY_ACTION',
                decision: finalAction,
                reason: execResult.message,
                confidence: txn.ai_confidence || 0.9,
                action: finalAction.toUpperCase(),
                result: execResult.status.toUpperCase()
            }
        });
        return {
            transaction: updatedTxn,
            actionResult: execResult
        };
    }
    static async simulateBatch() {
        const startTime = Date.now();
        const transactions = await prisma_1.prisma.transaction.findMany();
        let totalProcessed = 0;
        let atRiskRevenue = 0;
        let recoverableCount = 0;
        let recoverableRevenue = 0;
        let recoveredCount = 0;
        let recoveredRevenue = 0;
        let escalationCount = 0;
        let failedCount = 0;
        for (const txn of transactions) {
            totalProcessed++;
            atRiskRevenue += txn.amount;
            // 1. Analyze
            const analysis = await this.analyzeTransaction(txn.transaction_id);
            if (analysis.eligibility.isEligible) {
                recoverableCount++;
                recoverableRevenue += txn.amount;
                // 2. Execute
                const exec = await this.executeRecoveryAction(txn.transaction_id);
                if (exec.transaction.recovery_status === 'recovered') {
                    recoveredCount++;
                    recoveredRevenue += exec.transaction.recovered_amount;
                }
                else if (exec.transaction.recovery_status === 'escalated') {
                    escalationCount++;
                }
                else if (exec.transaction.recovery_status === 'failed' || exec.transaction.recovery_status === 'unrecoverable') {
                    failedCount++;
                }
            }
            else if (analysis.transaction.recovery_status === 'escalated') {
                escalationCount++;
            }
        }
        const durationMs = Date.now() - startTime;
        const recoveryRate = recoverableCount > 0 ? parseFloat(((recoveredCount / recoverableCount) * 100).toFixed(1)) : 0;
        const averageRecoveryAmount = recoveredCount > 0 ? parseFloat((recoveredRevenue / recoveredCount).toFixed(2)) : 0;
        // Save Simulation Run to database
        await prisma_1.prisma.simulationRun.create({
            data: {
                total_processed: totalProcessed,
                recoverable_count: recoverableCount,
                recovered_count: recoveredCount,
                recovered_amount: recoveredRevenue,
                recovery_rate: recoveryRate,
                escalation_count: escalationCount,
                duration_ms: durationMs
            }
        });
        return {
            totalProcessed,
            atRiskRevenue,
            recoverableCount,
            recoverableRevenue,
            recoveredCount,
            recoveredRevenue,
            recoveryRate,
            escalationCount,
            failedCount,
            averageRecoveryAmount,
            durationMs
        };
    }
    static async runFailureDemo() {
        // Pick or create a target transaction specifically for Gateway Timeout scenario
        let demoTxn = await prisma_1.prisma.transaction.findFirst({
            where: { failure_reason: 'bank_timeout' }
        });
        if (!demoTxn) {
            demoTxn = await prisma_1.prisma.transaction.create({
                data: {
                    transaction_id: `DEMO_FAIL_${Date.now()}`,
                    customer_id: 'CUST_DEMO_99',
                    customer_name: 'Aditya (Pitch Demo Corp)',
                    customer_email: 'demo@pitchcorp.in',
                    amount: 25000.0,
                    currency: 'INR',
                    payment_method: 'card',
                    failure_reason: 'bank_timeout',
                    attempt_number: 1,
                    customer_segment: 'Enterprise',
                    subscription_status: 'active',
                    previous_success_rate: 0.85,
                    days_since_last_payment: 10,
                    invoice_status: 'unpaid',
                    risk_score: 0.25,
                    risk_level: 'low',
                    recovery_status: 'at_risk',
                    recovery_attempts: 1, // Set attempts to 1 so next attempt hits limit
                    communication_attempts: 2
                }
            });
        }
        else {
            // Force attempts to threshold to trigger safety rule
            demoTxn = await prisma_1.prisma.transaction.update({
                where: { id: demoTxn.id },
                data: {
                    recovery_attempts: 1,
                    communication_attempts: 2,
                    recovery_status: 'at_risk'
                }
            });
        }
        // Step 1: AI Analysis
        const analysis = await this.analyzeTransaction(demoTxn.transaction_id);
        // Step 2: Attempt 1 execution (forces failure)
        const exec1 = await this.executeRecoveryAction(demoTxn.transaction_id, 'retry_payment');
        // Step 3: Trigger second execution which hits MAX_PAYMENT_RETRIES safety gate -> forces escalation
        const exec2 = await this.executeRecoveryAction(demoTxn.transaction_id, 'retry_payment');
        const auditLogs = await prisma_1.prisma.auditLog.findMany({
            where: { transaction_id: demoTxn.transaction_id },
            orderBy: { timestamp: 'asc' }
        });
        return {
            demoTransaction: exec2.transaction,
            steps: [
                { title: 'Payment Gateway Timeout', status: 'failed', detail: 'Initial transaction failed due to Bank Timeout' },
                { title: 'AI Recovery Recommendation', status: 'completed', detail: `AI recommended: ${analysis.aiDecision.recommendedAction} (Confidence: ${Math.round(analysis.aiDecision.confidence * 100)}%)` },
                { title: 'Simulated Retry Attempt #2', status: 'failed', detail: 'Automated payment retry attempted and failed' },
                { title: 'Safety Gate Rule Triggered', status: 'triggered', detail: 'MAX_PAYMENT_RETRIES (2) reached. Policy gate blocked further automated retries.' },
                { title: 'Human Escalation Created', status: 'escalated', detail: 'Automated recovery halted. Escalated to Tier-2 Support Operations team.' }
            ],
            auditLogs
        };
    }
}
exports.RecoveryOrchestrator = RecoveryOrchestrator;
