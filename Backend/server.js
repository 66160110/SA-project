// ===================================
// IT TICKET SUPPORT API SERVER
// ===================================

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// เพิ่มการนำเข้า autoStatusScheduler เพื่อเริ่มต้นการทำงาน
const { startAutoStatusScheduler } = require("./utils/autoStatusScheduler");

// Database connection
const { testConnection } = require("./config/db");

// Routes
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// Middleware
// ===================================

// CORS configuration (ย้ายขึ้นมาข้างบน)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // URL ของ React
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  if (req.path !== "/") {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// ===================================
// Routes
// ===================================

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IT Ticket Support API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      bugs: "/api/bugs",
      users: "/api/users",
      admin: "/api/admin", // 🆕 เพิ่ม endpoint admin
      statuses: "/api/statuses",
      priorities: "/api/priorities",
      stats: "/api/stats"
    }
  });
});

// API routes
app.use("/api", routes);

// ===================================
// Error Handling
// ===================================

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
    availableEndpoints: [
      "/api/auth/login",
      "/api/auth/register",
      "/api/bugs",
      "/api/admin/dashboard/stats", // 🆕
      "/api/admin/tickets", // 🆕
      "/api/statuses",
      "/api/priorities",
      "/api/users",
      "/api/stats"
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ===================================
// Start Server
// ===================================

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start server
    app.listen(PORT, () => {
      console.log("=".repeat(60));
      console.log("🚀 IT Ticket Support API Server Started");
      console.log("=".repeat(60));
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 Database: Connected`);
      console.log("");
      console.log("📋 Available Endpoints:");
      console.log("   • POST   /api/auth/login");
      console.log("   • POST   /api/auth/register");
      console.log("   • GET    /api/bugs");
      console.log("   • GET    /api/admin/dashboard/stats"); // 🆕  
      console.log("   • GET    /api/admin/tickets"); // 🆕
      console.log("   • GET    /api/statuses");
      console.log("   • GET    /api/priorities");
      console.log("   • GET    /api/users");
      console.log("   • GET    /api/stats");
      console.log("=".repeat(60));
      
      // 🌟 เริ่มต้น Scheduler
      startAutoStatusScheduler();
      console.log("⏰ Auto Status Scheduler: Started");
      console.log("=".repeat(60));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// ===================================
// Graceful Shutdown
// ===================================

process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer();