"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const router = (0, express_1.Router)();
router.get('/', audit_controller_1.getAuditLogs);
exports.default = router;
