"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const health_router_1 = __importDefault(require("./routes/health.router"));
const dashboard_router_1 = __importDefault(require("./routes/dashboard.router"));
const transaction_router_1 = __importDefault(require("./routes/transaction.router"));
const recovery_router_1 = __importDefault(require("./routes/recovery.router"));
const analytics_router_1 = __importDefault(require("./routes/analytics.router"));
const audit_router_1 = __importDefault(require("./routes/audit.router"));
const safety_router_1 = __importDefault(require("./routes/safety.router"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/health', health_router_1.default);
app.use('/api/dashboard', dashboard_router_1.default);
app.use('/api/transactions', transaction_router_1.default);
app.use('/api/recovery', recovery_router_1.default);
app.use('/api/analytics', analytics_router_1.default);
app.use('/api/audit-logs', audit_router_1.default);
app.use('/api/safety-rules', safety_router_1.default);
// Centralized Error Handler
app.use((err, req, res, next) => {
    console.error('💥 Unhandled Error:', err.stack || err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});
exports.default = app;
