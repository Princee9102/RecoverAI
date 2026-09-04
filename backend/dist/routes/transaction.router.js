"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const router = (0, express_1.Router)();
router.get('/', transaction_controller_1.getTransactions);
router.post('/generate', transaction_controller_1.generateTransactions);
router.get('/:id', transaction_controller_1.getTransactionById);
exports.default = router;
