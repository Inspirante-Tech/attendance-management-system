"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/database.ts
const express_1 = require("express");
const database_1 = __importDefault(require("../lib/database"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await database_1.default.healthCheck();
        if (isHealthy) {
            res.json({
                status: 'healthy',
                database: 'connected',
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.status(500).json({
                status: 'unhealthy',
                database: 'disconnected',
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            status: 'error',
            database: 'error',
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
});
// Data summary endpoint
router.get('/summary', async (req, res) => {
    try {
        const summary = await database_1.default.getDataSummary();
        res.json({
            status: 'success',
            data: summary,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            status: 'error',
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
