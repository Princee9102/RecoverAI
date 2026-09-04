-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transaction_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL DEFAULT 'Razorpay Customer',
    "customer_email" TEXT NOT NULL DEFAULT 'customer@example.com',
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "payment_method" TEXT NOT NULL,
    "failure_reason" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "customer_segment" TEXT NOT NULL,
    "subscription_status" TEXT NOT NULL,
    "previous_success_rate" REAL NOT NULL,
    "days_since_last_payment" INTEGER NOT NULL DEFAULT 30,
    "invoice_status" TEXT NOT NULL,
    "risk_score" REAL NOT NULL,
    "risk_level" TEXT NOT NULL DEFAULT 'medium',
    "recovery_status" TEXT NOT NULL DEFAULT 'at_risk',
    "recovery_action" TEXT,
    "ai_diagnosis" TEXT,
    "ai_explanation" TEXT,
    "ai_confidence" REAL,
    "recovered_amount" REAL NOT NULL DEFAULT 0.0,
    "recovery_attempts" INTEGER NOT NULL DEFAULT 0,
    "communication_attempts" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "RecoveryAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transaction_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "executed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gateway_response" TEXT,
    "error_message" TEXT,
    CONSTRAINT "RecoveryAction_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction" ("transaction_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "action" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    CONSTRAINT "AuditLog_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction" ("transaction_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SimulationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_processed" INTEGER NOT NULL,
    "recoverable_count" INTEGER NOT NULL,
    "recovered_count" INTEGER NOT NULL,
    "recovered_amount" REAL NOT NULL,
    "recovery_rate" REAL NOT NULL,
    "escalation_count" INTEGER NOT NULL,
    "duration_ms" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "SafetyRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rule_key" TEXT NOT NULL,
    "rule_value" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transaction_id_key" ON "Transaction"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyRule_rule_key_key" ON "SafetyRule"("rule_key");
