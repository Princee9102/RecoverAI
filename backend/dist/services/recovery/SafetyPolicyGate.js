"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyPolicyGate = void 0;
const recovery_schema_1 = require("../../schemas/recovery.schema");
class SafetyPolicyGate {
    static MAX_PAYMENT_RETRIES = 2;
    static MAX_RECOVERY_COMMS = 3;
    static evaluate(txn, proposedAction) {
        // Rule 1: Validate proposed action against strict ALLOWED_ACTIONS enum list
        const parseResult = recovery_schema_1.AllowedActionsSchema.safeParse(proposedAction);
        if (!parseResult.success) {
            return {
                isAllowed: false,
                actionToExecute: 'stop_recovery',
                policyReason: `Proposed action '${proposedAction}' is not in the strict backend allowlist. Execution rejected.`,
                ruleTriggered: 'UNALLOWED_ACTION'
            };
        }
        // Rule 2: Customer Opt-Out Check
        if (txn.subscription_status === 'opted_out') {
            return {
                isAllowed: false,
                actionToExecute: 'stop_recovery',
                policyReason: `Customer ${txn.customer_id} has opted out of automated recovery workflows.`,
                ruleTriggered: 'STOP_ON_OPT_OUT'
            };
        }
        // Rule 3: Stop immediately if already successfully recovered
        if (txn.recovery_status === 'recovered' || txn.recovered_amount > 0) {
            return {
                isAllowed: false,
                actionToExecute: 'stop_recovery',
                policyReason: 'Transaction is already fully recovered. No further action permitted.',
                ruleTriggered: 'STOP_ON_SUCCESS'
            };
        }
        // Rule 4: Payment retry limit enforcement (Max 2 payment retries)
        if (proposedAction === 'retry_payment' && txn.recovery_attempts >= SafetyPolicyGate.MAX_PAYMENT_RETRIES) {
            return {
                isAllowed: true,
                actionToExecute: 'escalate_to_human',
                policyReason: `Maximum automated payment retries (${SafetyPolicyGate.MAX_PAYMENT_RETRIES}) reached. Policy forces human escalation.`,
                ruleTriggered: 'MAX_PAYMENT_RETRIES_EXCEEDED'
            };
        }
        // Rule 5: Communication limit enforcement (Max 3 recovery communications)
        const isCommAction = ['send_payment_reminder', 'suggest_alternate_payment_method', 'send_checkout_link'].includes(proposedAction);
        if (isCommAction && txn.communication_attempts >= SafetyPolicyGate.MAX_RECOVERY_COMMS) {
            return {
                isAllowed: true,
                actionToExecute: 'escalate_to_human',
                policyReason: `Maximum recovery communications (${SafetyPolicyGate.MAX_RECOVERY_COMMS}) sent. Policy forces human escalation.`,
                ruleTriggered: 'MAX_RECOVERY_COMMS_EXCEEDED'
            };
        }
        // Rule 6: Repeat failure threshold -> Escalate to human
        if (txn.recovery_attempts >= 2 && txn.communication_attempts >= 2 && proposedAction !== 'escalate_to_human') {
            return {
                isAllowed: true,
                actionToExecute: 'escalate_to_human',
                policyReason: 'Multiple payment & communication attempts failed. Policy forces human escalation.',
                ruleTriggered: 'REPEAT_FAILURE_ESCALATION'
            };
        }
        // Default: Action passed policy gate
        return {
            isAllowed: true,
            actionToExecute: proposedAction,
            policyReason: `Action '${proposedAction}' passed backend safety rules validation.`
        };
    }
}
exports.SafetyPolicyGate = SafetyPolicyGate;
