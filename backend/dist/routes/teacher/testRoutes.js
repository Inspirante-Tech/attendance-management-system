"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Protected test route
router.get('/', auth_1.authenticateToken, auth_1.requireTeacher, (req, res) => {
    res.json({ status: 'ok', message: 'Teacher auth working ✅' });
});
exports.default = router;
