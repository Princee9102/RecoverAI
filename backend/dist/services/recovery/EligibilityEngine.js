"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EligibilityEngine = void 0;
class EligibilityEngine {
    static evaluateEligibility(txn) {
        if (txn.subscription_status === 'opted_out') {
            return {
                isEligible: false,
                score: 0.0,
                reason: 'Customer explicitly opted out of communications.',
                category: 'ineligible'
            };
        }
        if (txn.recovery_status === 'recovered') {
            return {
                isEligible: false,
                score: 0.0,
                reason: 'Transaction is already recovered.',
                category: 'ineligible'
            };
        }
        if (txn.recovery_status === 'escalated') {
            return {
                isEligible: false,
                score: 0.1,
                reason: 'Transaction escalated to human team.',
                category: 'ineligible'
            };
        }
        let score = 0.5;
        // Failure reason weighting
        if (txn.failure_reason === 'bank_timeout' || txn.failure_reason === 'network_error') {
            score += 0.35;
        }
        else if (txn.failure_reason === 'authentication_failed' || txn.failure_reason === 'checkout_abandoned') {
            score += 0.25;
        }
        else if (txn.failure_reason === 'insufficient_funds' || txn.failure_reason === 'card_declined') {
            score += 0.15;
        }
        else if (txn.failure_reason === 'expired_card') {
            score += 0.10;
        }
        // Historical success rate weighting
        score += txn.previous_success_rate * 0.20;
        // Recency weighting
        if (txn.days_since_last_payment <= 14) {
            score += 0.10;
        }
        // Attempt penalty
        score -= (txn.recovery_attempts + txn.communication_attempts) * 0.15;
        score = Math.min(Math.max(score, 0.0), 1.0);
        let category = 'standard';
        if (score >= 0.75)
            category = 'high_priority';
        else if (score >= 0.45)
            category = 'standard';
        else
            category = 'low_priority';
        return {
            isEligible: score > 0.25,
            score: parseFloat(score.toFixed(2)),
            reason: `Recovery score ${Math.round(score * 100)}% based on ${txn.failure_reason} and ${Math.round(txn.previous_success_rate * 100)}% past success rate.`,
            category
        };
    }
}
exports.EligibilityEngine = EligibilityEngine;
