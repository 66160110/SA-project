// ===================================
// Dashboard & Metadata Controller - (อัปเกรดแล้ว)
// ===================================

const { pool } = require("../config/db");

/**
 * ดึงรายการ statuses ทั้งหมด (ที่ตรงกับ init.sql)
 * GET /api/statuses
 */
const getStatuses = async (req, res) => {
  try {
    const statuses = [
      { value: "open", label: "Open", description: "Bug has been reported" },
      {
        value: "in_progress",
        label: "In Progress",
        description: "Staff is working on it",
      },
      {
        value: "resolved",
        label: "Resolved",
        description: "Bug has been fixed",
      },
      {
        value: "closed",
        label: "Closed",
        description: "Bug is verified and closed",
      },
    ];

    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Get statuses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve statuses",
      error: error.message,
    });
  }
};

/**
 * ดึงรายการ priorities ทั้งหมด (ที่ตรงกับ init.sql)
 * GET /api/priorities
 */
const getPriorities = async (req, res) => {
  try {
    const priorities = [
      { value: "low", label: "Low", color: "#52c41a" },
      { value: "medium", label: "Medium", color: "#faad14" },
      { value: "high", label: "High", color: "#fa8c16" },
      { value: "critical", label: "Critical", color: "#f5222d" },
    ];

    res.json({
      success: true,
      data: priorities,
    });
  } catch (error) {
    console.error("Get priorities error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve priorities",
      error: error.message,
    });
  }
};

/**
 * ดึงรายชื่อผู้ใช้ทั้งหมด (สำหรับการมอบหมายงาน)
 * GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        id, username, email, role, createdAt
      FROM Users
      ORDER BY username ASC
    `);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

/**
 * ดึงสถิติของ bugs (สำหรับ dashboard)
 * GET /api/stats
 */
const getStats = async (req, res) => {
  try {
    // นับจำนวน bugs ตาม status
    const [statusStats] = await pool.query(`
      SELECT 
        status, 
        COUNT(*) as count
      FROM Bugs
      GROUP BY status
    `);

    // นับจำนวน bugs ตาม priority
    const [priorityStats] = await pool.query(`
      SELECT 
        priority, 
        COUNT(*) as count
      FROM Bugs
      GROUP BY priority
    `);

    // นับจำนวน bugs ทั้งหมด
    const [totalBugs] = await pool.query("SELECT COUNT(*) as total FROM Bugs");

    // นับจำนวน bugs ที่ยังไม่ได้มอบหมาย
    const [unassignedBugs] = await pool.query(
      "SELECT COUNT(*) as count FROM Bugs WHERE assigneeId IS NULL"
    );

    res.json({
      success: true,
      data: {
        total: totalBugs[0].total,
        unassigned: unassignedBugs[0].count,
        byStatus: statusStats,
        byPriority: priorityStats,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve statistics",
      error: error.message,
    });
  }
};

// ===================================
// 🆕 ฟังก์ชันใหม่สำหรับ Admin Dashboard
// ===================================

/**
 * ดึงสถิติสำหรับ Admin Dashboard
 * GET /api/admin/dashboard/stats
 * Response: { totalTickets, totalUsers, totalStaffs }
 */
const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. นับจำนวน Tickets ทั้งหมด
    const [ticketCount] = await pool.query(
      "SELECT COUNT(*) as total FROM Bugs"
    );

    // 2. นับจำนวน Users ทั้งหมด
    const [userCount] = await pool.query(
      "SELECT COUNT(*) as total FROM Users"
    );

    // 3. นับจำนวน Staff (role = 'staff')
    const [staffCount] = await pool.query(
      "SELECT COUNT(*) as total FROM Users WHERE role = 'staff'"
    );

    res.json({
      success: true,
      data: {
        totalTickets: ticketCount[0].total,
        totalUsers: userCount[0].total,
        totalStaffs: staffCount[0].total,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * ดึงรายการ Tickets ทั้งหมด (เรียงตาม created_at ล่าสุด)
 * GET /api/admin/tickets
 * Response: [ { ticket_id, title, status, priority, created_at, assigned_to_name } ]
 */
const getAllTicketsForAdmin = async (req, res) => {
  try {
    const [tickets] = await pool.query(`
      SELECT 
        b.id as ticket_id,
        b.title,
        b.status,
        b.priority,
        b.createdAt as created_at,
        u.username as assigned_to_name
      FROM Bugs b
      LEFT JOIN Users u ON b.assigneeId = u.id
      ORDER BY b.createdAt DESC
    `);

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Get all tickets for admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tickets",
      error: error.message,
    });
  }
};

module.exports = {
  getStatuses,
  getPriorities,
  getUsers,
  getStats,
  getAdminDashboardStats,    // 🆕 Export ฟังก์ชันใหม่
  getAllTicketsForAdmin,     // 🆕 Export ฟังก์ชันใหม่
};