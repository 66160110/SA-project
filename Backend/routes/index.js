const express = require("express");
const router = express.Router();

// Controllers
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

const {
  getAllBugs,
  getBugById,
  createBug,
  updateBug,
  patchBug,
  deleteBug,
} = require("../controllers/bugController");

const {
  getCommentsByBugId,
  createComment,
  deleteComment,
} = require("../controllers/commentController");

const {
  getStatuses,
  getPriorities,
  getUsers,
  getStats,
  getAdminDashboardStats,     // 🆕 เพิ่ม
  getAllTicketsForAdmin,      // 🆕 เพิ่ม
} = require("../controllers/dashboardController");

// Middleware
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkPermission, checkAnyPermission, checkRole } = require("../middlewares/roleMiddleware");

// 🌟 Import Utils
const { manualTrigger } = require("../utils/autoStatusScheduler");

// ===================================
// Routes
// ===================================

// --- Auth Routes ---
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", verifyToken, getCurrentUser);

// --- Bug Routes ---
router.get("/bugs",
  verifyToken,
  checkAnyPermission(["bug:read:own", "bug:read:assigned", "bug:read:all"]),
  getAllBugs
);
router.post("/bugs",
  verifyToken,
  checkPermission("bug:create"),
  createBug
);
router.get("/bugs/:bugId",
  verifyToken,
  checkAnyPermission(["bug:read:own", "bug:read:assigned", "bug:read:all"]),
  getBugById
);
router.put("/bugs/:bugId",
  verifyToken,
  checkAnyPermission(["bug:update:own", "bug:update:all"]),
  updateBug
);
router.patch("/bugs/:bugId",
  verifyToken,
  checkAnyPermission(["bug:update:own", "bug:update:status", "bug:update:all"]),
  patchBug
);
router.delete("/bugs/:bugId",
  verifyToken,
  checkPermission("bug:delete"),
  deleteBug
);

// --- Comment Routes ---
router.get(
  "/bugs/:bugId/comments",
  verifyToken,
  checkAnyPermission(["bug:read:own", "bug:read:assigned", "bug:read:all"]),
  getCommentsByBugId
);
router.post(
  "/bugs/:bugId/comments",
  verifyToken,
  checkPermission("comment:create"),
  createComment
);
router.delete(
  "/comments/:commentId",
  verifyToken,
  checkAnyPermission(["comment:delete:own", "comment:delete:all"]),
  deleteComment
);

// --- Metadata & Stats Routes ---
router.get(
  "/statuses",
  verifyToken,
  checkPermission("meta:read"),
  getStatuses
);

router.get(
  "/priorities",
  verifyToken,
  checkPermission("meta:read"),
  getPriorities
);

router.get(
  "/users",
  verifyToken,
  checkPermission("user:read:all"),
  getUsers
);

router.get(
  "/stats",
  verifyToken,
  checkPermission("stats:read"),
  getStats
);

// ===================================
// 🆕 Admin Routes
// ===================================

/**
 * GET /api/admin/dashboard/stats
 * ดึงสถิติ: All Ticket, All User, All Staff
 */
router.get(
  "/admin/dashboard/stats",
  verifyToken,
  checkRole(["admin"]),
  getAdminDashboardStats
);

/**
 * GET /api/admin/tickets
 * ดึงรายการ Tickets ทั้งหมด (เรียงตาม created_at ล่าสุด)
 */
router.get(
  "/admin/tickets",
  verifyToken,
  checkRole(["admin"]),
  getAllTicketsForAdmin
);

module.exports = router;