// ===================================
// Admin Routes - สำหรับ Manual Trigger และ Testing
// ===================================

const express = require("express");
const router = express.Router();
const { authenticate } = require("./middlewares/authMiddleware");
const { checkRole } = require("./middlewares/roleMiddleware");
const { manualTrigger } = require("./utils/autoStatusScheduler");

/**
 * 🧪 Manual Trigger สำหรับทดสอบระบบ Auto-Status
 * POST /api/admin/trigger-auto-status
 * 
 * Body (optional):
 * {
 *   "testMode": true,
 *   "resolved": 0.0167,  // 1 นาที (แทน 24 ชม.)
 *   "closed": 0.0334      // 2 นาที (แทน 48 ชม.)
 * }
 */
router.post(
  "/trigger-auto-status",
  authenticate,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      console.log(`🧪 [Manual Trigger] Triggered by admin: ${req.user.username}`);
      
      const { testMode, resolved, closed } = req.body;
      
      // ✨ รองรับโหมดทดสอบ
      let customHours = null;
      if (testMode && (resolved || closed)) {
        customHours = {
          resolved: resolved || 24,  // default 24 ชม.
          closed: closed || 48        // default 48 ชม.
        };
        console.log(`🧪 [Test Mode] Using custom time:`, customHours);
      }
      
      // เรียกฟังก์ชันอัปเดต status
      const summary = await manualTrigger(customHours);
      
      res.json({
        success: true,
        message: "Auto-status update triggered successfully",
        triggeredBy: req.user.username,
        timestamp: new Date().toISOString(),
        testMode: !!testMode,
        customHours: customHours,
        summary: summary
      });
    } catch (error) {
      console.error("Manual trigger error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to trigger auto-status update",
        error: error.message,
      });
    }
  }
);

/**
 * 📊 ดูสถิติการอัปเดตอัตโนมัติ
 * GET /api/admin/auto-status-stats
 */
router.get(
  "/auto-status-stats",
  authenticate,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const { pool } = require("./config/db");
      
      // นับจำนวน bugs แต่ละ status
      const [stats] = await pool.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM Bugs
        GROUP BY status
      `);
      
      // หา bugs ที่ใกล้จะถูกอัปเดตอัตโนมัติ (20+ ชม.)
      const [nearResolve] = await pool.query(`
        SELECT 
          b.id, 
          b.title,
          b.status,
          b.updatedAt,
          TIMESTAMPDIFF(HOUR, b.updatedAt, NOW()) as hoursSinceUpdate
        FROM Bugs b
        WHERE b.status IN ('open', 'in_progress')
          AND TIMESTAMPDIFF(HOUR, b.updatedAt, NOW()) >= 20
        ORDER BY hoursSinceUpdate DESC
      `);
      
      // หา bugs ที่จะถูกปิดเร็วๆ นี้ (40+ ชม.)
      const [nearClose] = await pool.query(`
        SELECT 
          b.id, 
          b.title,
          b.status,
          b.updatedAt as resolvedTime,
          TIMESTAMPDIFF(HOUR, b.updatedAt, NOW()) as hoursSinceResolved
        FROM Bugs b
        WHERE b.status = 'resolved'
          AND TIMESTAMPDIFF(HOUR, b.updatedAt, NOW()) >= 40
        ORDER BY hoursSinceResolved DESC
      `);
      
      res.json({
        success: true,
        data: {
          statusCounts: stats,
          nearAutoResolve: nearResolve,
          nearAutoClose: nearClose,
        },
      });
    } catch (error) {
      console.error("Get auto-status stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve stats",
        error: error.message,
      });
    }
  }
);

module.exports = router;