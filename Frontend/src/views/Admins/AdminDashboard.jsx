// ===================================
// AdminDashboard.jsx - หน้า Dashboard แสดงสถิติ
// ===================================

import { useState, useEffect } from 'react';
import { getDashboardStats, getAllTickets } from '../../services/adminService';
import { logout } from '../../services/authService';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalUsers: 0,
    totalStaffs: 0
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false); // 🆕 เพิ่ม state dropdown

  // ดึงข้อมูลเมื่อ component โหลด
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ดึงสถิติ
      const statsData = await getDashboardStats();
      console.log('📊 Stats Data:', statsData);
      
      if (statsData.success && statsData.data) {
        setStats({
          totalTickets: statsData.data.totalTickets || 0,
          totalUsers: statsData.data.totalUsers || 0,
          totalStaffs: statsData.data.totalStaffs || 0
        });
      }

      // ดึงรายการ Ticket
      const ticketsData = await getAllTickets();
      console.log('🎫 Tickets Data:', ticketsData);
      
      if (ticketsData.success && ticketsData.data) {
        setTickets(ticketsData.data);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแสดงสี priority
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return '#f5222d';
      case 'high': return '#fa8c16';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#6b7280';
    }
  };

  // แปลง status เป็นภาษาไทย
  const getStatusLabel = (status) => {
    const statusMap = {
      'open': 'Open',
      'in_progress': 'In-Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  };

  // แปลง priority เป็นตัวพิมพ์ใหญ่
  const getPriorityLabel = (priority) => {
    if (!priority) return '-';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  // ฟอร์แมตวันที่แบบไทย (เช่น "6 hours ago" หรือ "9/11/2568")
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // ถ้าห่างไม่เกิน 24 ชั่วโมง แสดง "X hours ago"
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }

    // ถ้าห่างไม่เกิน 7 วัน แสดง "X days ago"
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    
    // ถ้าห่างเกิน 7 วัน แสดงเป็นวันที่ (รูปแบบไทย)
    const thaiYear = date.getFullYear() + 543;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}/${thaiYear}`;
  };

  // ดึงข้อมูล User จาก localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const username = currentUser.username || 'Admin';

  // ฟังก์ชัน Logout
  const handleLogout = () => {
    logout();
  };

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.user-info')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  if (loading) {
    return <div className="loading">กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="user-avatar">👤</div>
          <span>{username}</span>
          <span className="dropdown-icon">▼</span>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-item dropdown-user">
                <strong>{username}</strong>
                <span className="user-role">Admin</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                <span className="logout-icon">🚪</span>
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card stat-ticket">
          <h2>ALL Ticket: <span>{stats.totalTickets}</span></h2>
        </div>
        
        <div className="stat-card stat-user">
          <h2>ALL User: <span>{stats.totalUsers}</span></h2>
        </div>
        
        <div className="stat-card stat-staff">
          <h2>ALL Staff: <span>{stats.totalStaffs}</span></h2>
        </div>
      </div>

      {/* Ticket List Button */}
      <button className="ticket-list-btn">Ticket List</button>

      {/* Ticket Table */}
      <div className="ticket-table-container">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>หมายเหตุ</th>
              <th>สถานะ</th>
              <th>ระดับความรุนแรง</th>
              <th>เวลาที่สร้าง</th>
              <th>ผู้รับผิดชอบ</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                  ไม่มีข้อมูล Ticket
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.ticket_id}>
                  <td>{ticket.ticket_id}</td>
                  <td className="ticket-title" title={ticket.title}>
                    {ticket.title || '-'}
                  </td>
                  <td>{getStatusLabel(ticket.status)}</td>
                  <td>
                    <span 
                      className="priority-badge"
                      style={{ color: getPriorityColor(ticket.priority) }}
                    >
                      {getPriorityLabel(ticket.priority)}
                    </span>
                  </td>
                  <td>{formatDate(ticket.created_at)}</td>
                  <td>{ticket.assigned_to_name || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;