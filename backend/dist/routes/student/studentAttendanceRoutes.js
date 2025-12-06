"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/studentAttendance.ts
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../../lib/database"));
// Adjust the import path as necessary
const router = express_1.default.Router();
//get monthly attendacne data
// GET /students/:userId/attendance/monthly?year=2025&month=8
router.get("/:userId/attendance/monthly", async (req, res) => {
    try {
        const { userId } = req.params;
        let { year, month } = req.query;
        const prisma = database_1.default.getInstance();
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        if (!year || !month) {
            return res.status(400).json({ error: "year and month are required" });
        }
        const student = await prisma.student.findUnique({
            where: { userId: userId }
        });
        console.log("student :", student, "userId:", userId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        const studentId = student.id;
        const numericYear = parseInt(year, 10);
        const numericMonth = parseInt(month, 10); // 1-12
        if (isNaN(numericYear) || isNaN(numericMonth)) {
            return res.status(400).json({ error: "Invalid year or month" });
        }
        // Get the first and last day of the month
        const startDate = new Date(numericYear, numericMonth - 1, 1);
        const endDate = new Date(numericYear, numericMonth, 0);
        // Fetch attendance records for this student within the month
        const attendanceRecords = await prisma.attendanceRecord.findMany({
            where: {
                studentId: studentId,
                attendance: {
                    classDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
            include: {
                attendance: {
                    include: {
                        offering: {
                            include: {
                                course: true,
                            },
                        },
                    },
                },
            },
        });
        // Transform into MonthlyAttendanceData format
        const monthlyAttendance = {};
        // Initialize all days of month with empty attendance
        const daysInMonth = endDate.getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const key = `${numericYear}-${String(numericMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            monthlyAttendance[key] = {
                present: 0,
                absent: 0,
                total: 0,
                classes: [],
            };
        }
        // Fill in actual attendance
        attendanceRecords.forEach(record => {
            const dateKey = record.attendance?.classDate?.toISOString().split('T')[0];
            if (!dateKey)
                return;
            const classStatus = record.status === 'present' ? 'present' : 'absent';
            monthlyAttendance[dateKey] = monthlyAttendance[dateKey] || { present: 0, absent: 0, total: 0, classes: [] };
            monthlyAttendance[dateKey].total += 1;
            if (classStatus === 'present')
                monthlyAttendance[dateKey].present += 1;
            else
                monthlyAttendance[dateKey].absent += 1;
            monthlyAttendance[dateKey].classes.push({
                course_name: record.attendance?.offering?.course?.name || 'Unknown',
                course_code: record.attendance?.offering?.course?.code || 'N/A',
                status: classStatus,
                period_number: record.attendance?.periodNumber || 1,
            });
        });
        res.json({
            status: "success",
            data: monthlyAttendance,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
