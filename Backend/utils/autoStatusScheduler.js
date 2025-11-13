// ===================================
// Auto Status Scheduler - อัปเดต Status อัตโนมัติ (FIXED)
// ===================================

const cron = require("node-cron");
const { pool } = require("../config/db");

/**
 * ฟังก์ชันอัปเดต status ของ bugs อัตโนมัติ
 * 
 * เงื่อนไข:
 * - ถ้า user ไม่ comment ตอบกลับภายใน 24 ชม. → เปลี่ยน status เป็น 'resolved'
 * - ถ้า user ไม่ comment ตอบกลับภายใน 48 ชม. → เปลี่ยน status เป็น 'closed'
 */
async function autoUpdateBugStatus() {
  try {
    console.log("\n🔄 [Auto-Status] Starting auto status update...");
    
    const now = new Date();
    // 5 * 60 * 1000 (5 นาที)
    const twentyFourHoursAgo = new Date(now.getTime() - 5 * 60 * 1000);
    // 10 * 60 * 1000 (10 นาที)
    const fortyEightHoursAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // 1️ หา bugs ที่ควรเปลี่ยนเป็น 'resolved' (5 นาที)
    // 🔧 ใช้ LEFT JOIN แทน Subquery เพื่อหลีกเลี่ยง alias conflict
    const [bugsToResolve] = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.status,
        b.updatedAt,
        MAX(c.createdAt) as lastUserCommentTime
      FROM Bugs b
      LEFT JOIN Comments c ON c.bugId = b.id AND c.userId = b.reporterId
      WHERE b.status IN ('open', 'in_progress')
        AND b.updatedAt < ?
      GROUP BY b.id, b.title, b.status, b.updatedAt
      HAVING 
        MAX(c.createdAt) IS NULL 
        OR MAX(c.createdAt) < ?
      `,
      [twentyFourHoursAgo, twentyFourHoursAgo]
    );

    // อัปเดตเป็น 'resolved'
    if (bugsToResolve.length > 0) {
      const bugIdsToResolve = bugsToResolve.map((bug) => bug.id);
      
      await pool.query(
        `UPDATE Bugs 
         SET status = 'resolved', updatedAt = NOW() 
         WHERE id IN (?)`,
        [bugIdsToResolve]
      );
      
      console.log(`✅ [Auto-Status] Updated ${bugsToResolve.length} bug(s) to 'resolved'`);
      bugsToResolve.forEach((bug) => {
        console.log(`   - Bug #${bug.id}: "${bug.title}" (Last updated: ${bug.updatedAt})`);
      });
    }

    // 2️⃣ หา bugs ที่ควรเปลี่ยนเป็น 'closed' (48 ชม.)
    const [bugsToClose] = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.status,
        b.updatedAt,
        MAX(c.createdAt) as lastUserCommentTime
      FROM Bugs b
      LEFT JOIN Comments c ON c.bugId = b.id AND c.userId = b.reporterId
      WHERE b.status = 'resolved'
        AND b.updatedAt < ?
      GROUP BY b.id, b.title, b.status, b.updatedAt
      HAVING 
        MAX(c.createdAt) IS NULL 
        OR MAX(c.createdAt) < ?
      `,
      // 
      [fiveMinutesAgo, fiveMinutesAgo]
    );

    // อัปเดตเป็น 'closed'
    if (bugsToClose.length > 0) {
      const bugIdsToClose = bugsToClose.map((bug) => bug.id);
      
      await pool.query(
        `UPDATE Bugs 
         SET status = 'closed', updatedAt = NOW() 
         WHERE id IN (?)`,
        [bugIdsToClose]
      );
      
      console.log(`✅ [Auto-Status] Updated ${bugsToClose.length} bug(s) to 'closed'`);
      bugsToClose.forEach((bug) => {
        console.log(`   - Bug #${bug.id}: "${bug.title}" (Last updated: ${bug.updatedAt})`);
      });
    }

    if (bugsToResolve.length === 0 && bugsToClose.length === 0) {
      console.log("ℹ️  [Auto-Status] No bugs need status update");
    }

    console.log("✅ [Auto-Status] Auto status update completed\n");
  } catch (error) {
    console.error("❌ [Auto-Status] Error during auto status update:", error);
  }
}

/**
 * ฟังก์ชันสำหรับ Manual Trigger (เรียกจาก Admin API)
 * ✨ รองรับการทดสอบด้วยเวลาที่สั้นลง เช่น 1 นาที แทน 24 ชม.
 */
async function manualTrigger(customHours = null) {
  try {
    console.log("\n🧪 [Manual Trigger] Starting manual auto-status update...");
    
    // ✨ รองรับการทดสอบด้วยเวลาที่กำหนดเอง
    // ตัวอย่าง: { resolved: 0.0167, closed: 0.0334 } = 1 นาทีและ 2 นาที
    const hoursForResolved = customHours?.resolved || 24;
    const hoursForClosed = customHours?.closed || 48;
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - hoursForResolved * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - hoursForClosed * 60 * 60 * 1000);

    console.log(`⏱️  [Manual Trigger] Using custom time window:`);
    console.log(`   - Resolved: ${hoursForResolved} hours ago (${hoursForResolved * 60} minutes)`);
    console.log(`   - Closed: ${hoursForClosed} hours ago (${hoursForClosed * 60} minutes)`);

    // 1️⃣ หา bugs ที่ควรเปลี่ยนเป็น 'resolved'
    const [bugsToResolve] = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.status,
        b.updatedAt,
        MAX(c.createdAt) as lastUserCommentTime
      FROM Bugs b
      LEFT JOIN Comments c ON c.bugId = b.id AND c.userId = b.reporterId
      WHERE b.status IN ('open', 'in_progress')
        AND b.updatedAt < ?
      GROUP BY b.id, b.title, b.status, b.updatedAt
      HAVING 
        MAX(c.createdAt) IS NULL 
        OR MAX(c.createdAt) < ?
      `,
      [tenMinutesAgo, tenMinutesAgo]
    );

    // อัปเดตเป็น 'resolved'
    if (bugsToResolve.length > 0) {
      const bugIdsToResolve = bugsToResolve.map((bug) => bug.id);
      
      await pool.query(
        `UPDATE Bugs 
         SET status = 'resolved', updatedAt = NOW() 
         WHERE id IN (?)`,
        [bugIdsToResolve]
      );
      
      console.log(`✅ [Manual Trigger] Updated ${bugsToResolve.length} bug(s) to 'resolved'`);
      bugsToResolve.forEach((bug) => {
        console.log(`   - Bug #${bug.id}: "${bug.title}"`);
      });
    }

    // 2️⃣ หา bugs ที่ควรเปลี่ยนเป็น 'closed'
    const [bugsToClose] = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.status,
        b.updatedAt,
        MAX(c.createdAt) as lastUserCommentTime
      FROM Bugs b
      LEFT JOIN Comments c ON c.bugId = b.id AND c.userId = b.reporterId
      WHERE b.status = 'resolved'
        AND b.updatedAt < ?
      GROUP BY b.id, b.title, b.status, b.updatedAt
      HAVING 
        MAX(c.createdAt) IS NULL 
        OR MAX(c.createdAt) < ?
      `,
      [fortyEightHoursAgo, fortyEightHoursAgo]
    );

    // อัปเดตเป็น 'closed'
    if (bugsToClose.length > 0) {
      const bugIdsToClose = bugsToClose.map((bug) => bug.id);
      
      await pool.query(
        `UPDATE Bugs 
         SET status = 'closed', updatedAt = NOW() 
         WHERE id IN (?)`,
        [bugIdsToClose]
      );
      
      console.log(`✅ [Manual Trigger] Updated ${bugsToClose.length} bug(s) to 'closed'`);
      bugsToClose.forEach((bug) => {
        console.log(`   - Bug #${bug.id}: "${bug.title}"`);
      });
    }

    const summary = {
      resolved: bugsToResolve.length,
      closed: bugsToClose.length,
      total: bugsToResolve.length + bugsToClose.length,
      bugsToResolve: bugsToResolve.map(b => ({ id: b.id, title: b.title })),
      bugsToClose: bugsToClose.map(b => ({ id: b.id, title: b.title })),
    };

    if (summary.total === 0) {
      console.log("ℹ️  [Manual Trigger] No bugs need status update");
    }

    console.log("✅ [Manual Trigger] Manual trigger completed\n");
    return summary;
  } catch (error) {
    console.error("❌ [Manual Trigger] Error during manual trigger:", error);
    throw error;
  }
}

function startAutoStatusScheduler() {
  // ทำงานทันทีเมื่อเริ่มต้น server
  autoUpdateBugStatus();

  // ตั้งเวลาให้ทำงานทุกๆ 5 นาที
  cron.schedule("*/5 * * * *", () => { // <-- [Gemini] แก้ไขตรงนี้
    autoUpdateBugStatus();
  });

  console.log("🔧 [Auto-Status] Scheduler started");
  console.log("⏰ [Auto-Status] Running every 5 minutes"); // <-- [Gemini] แก้ไข log
}

module.exports = {
  startAutoStatusScheduler,
  autoUpdateBugStatus,
  manualTrigger,
};