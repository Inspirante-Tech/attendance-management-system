"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const studentInfoRoutes_1 = __importDefault(require("./studentInfoRoutes"));
const studentMarksRoutes_1 = __importDefault(require("./studentMarksRoutes"));
const studentAttendanceRoutes_1 = __importDefault(require("./studentAttendanceRoutes"));
const studentStatsRoutes_1 = __importDefault(require("./studentStatsRoutes"));
const router = (0, express_1.Router)();
console.log('=== STUDENT ROUTES MODULE LOADED ===');
// Apply authentication middleware to all student routes
router.use(auth_1.authenticateToken);
router.use(auth_1.requireStudent);
// Mount all student route modules
router.use('/', studentInfoRoutes_1.default);
router.use('/', studentAttendanceRoutes_1.default);
router.use('/', studentMarksRoutes_1.default);
router.use('/', studentStatsRoutes_1.default);
exports.default = router;
