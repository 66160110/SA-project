// ===================================
// Staff Home Page - หน้าแรกของ Support Staff
// ไฟล์: src/views/Staffs/StaffHome.jsx
// ===================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStaffTickets } from "../../services/staffService";
import "./StaffHome.css";

const StaffHome = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest
  const [showDropdown, setShowDropdown] = useState(false); // 🆕 เพิ่ม state dropdown

 // ดึงข้อมูล user จาก localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  
 // ฟังก์ชัน Logout
  const handleLogout = () => {
    // ล้างข้อมูลผู้ใช้ที่เก็บไว้และไปหน้าล็อกอิน
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest(".user-info")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);

  // ดึงข้อมูล tickets เมื่อ component โหลด
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // เรียก API
      const response = await getStaffTickets();

      // กรองเฉพาะ tickets ที่:
      // 1. ยังไม่มีคนรับผิดชอบ (assigneeId = null)
      // 2. หรือเป็นของ staff คนนี้
      const filteredTickets = response.data.filter(
        (ticket) =>
          ticket.assigneeId === null || ticket.assigneeId === currentUser.id
      );

      setTickets(filteredTickets);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  // เรียงลำดับ tickets
  const sortedTickets = [...tickets].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  // ฟังก์ชันแสดงสี priority
  const getPriorityColor = (priority) => {
    const colors = {
      low: "#52c41a",
      medium: "#faad14",
      high: "#fa8c16",
      critical: "#f5222d",
    };
    return colors[priority] || "#999";
  };

  // ฟังก์ชันแสดง status เป็นภาษาไทย
  const getStatusLabel = (status) => {
    const labels = {
      null: "-",
      open: "Open",
      in_progress: "In-Progress",
      resolved: "Resolved",
      closed: "Closed",
    };
    return labels[status] || "-";
  };

  // ฟังก์ชันจัดรูปแบบวันที่
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  // กดปุ่ม View → ไปหน้ารายละเอียด
  const handleViewTicket = (ticketId) => {
    navigate(`/staff/tickets/${ticketId}`);
  };

  if (loading) {
    return (
      <div className="staff-home">
        <div className="loading">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staff-home">
        <div className="error">
          <p>⚠️ {error}</p>
          <button onClick={fetchTickets}>ลองอีกครั้ง</button>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-home">
      {/* Header */}
      {/* ใหม่ + logout  */}

      <div className="navbar-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div
            className="user-info"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">👤</div>
            <span>{currentUser.username}</span>
            <span className="dropdown-icon">▼</span>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-item dropdown-user">
                  <strong>{currentUser.username}</strong>
                  {/* <span className="user-role"></span> */}
                </div>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item dropdown-logout"
                  onClick={handleLogout}
                >
                  <span className="logout-icon">🚪</span>
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* เก่า */}
      {/* <header className="staff-header">
        <div className="header-left">
          <h1>IT Support Ticket</h1>
        </div>
        <div className="header-right"> */}
      {/* <div className="notification-icon">
            🔔
            {tickets.filter(t => t.assigneeId === null).length > 0 && (
              <span className="badge">
                {tickets.filter(t => t.assigneeId === null).length}
              </span>
            )}
          </div> */}
      {/* <div className="user-profile"> */}
      {/* <img 
              src={currentUser.avatar || 'https://via.placeholder.com/40'} 
              alt="Profile" 
            /> */}
      {/* <span>{currentUser.username || 'Sara'}</span>
            <span className="dropdown-icon">▼</span>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <div className="content-container">
        <div className="controls">
          <button className="all-ticket-btn">ALL Ticket</button>

          <select
            className="sort-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Ticket Table */}
        <div className="ticket-table-container">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>หมายเหตุ</th>
                <th>หมวดหมู่</th>
                <th>สถานะ</th>
                <th>ระดับความร้ายแรง</th>
                <th>เวลาที่สร้าง</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {sortedTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    ไม่มี Ticket ที่ต้องดูแล
                  </td>
                </tr>
              ) : (
                sortedTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.id}</td>
                    <td className="ticket-title">
                      {ticket.title.length > 20
                        ? ticket.title.substring(0, 20) + "..."
                        : ticket.title}
                    </td>
                    <td>{ticket.category || "Server"}</td>
                    <td>
                      <span className="status-badge">
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="priority-badge"
                        style={{ color: getPriorityColor(ticket.priority) }}
                      >
                        {ticket.priority.charAt(0).toUpperCase() +
                          ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(ticket.createdAt)}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewTicket(ticket.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
