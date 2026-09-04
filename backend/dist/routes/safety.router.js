"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const safety_controller_1 = require("../controllers/safety.controller");
const router = (0, express_1.Router)();
router.get('/', safety_controller_1.getSafetyRules);
exports.default = router;
