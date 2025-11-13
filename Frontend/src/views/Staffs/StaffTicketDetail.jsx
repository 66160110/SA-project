// ===================================
// Staff Ticket Detail Page - รายละเอียด Ticket + Chat
// ไฟล์: src/views/Staffs/StaffTicketDetail.jsx
// ===================================

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicketById,
  getTicketComments,
  createComment,
  updateTicket,
} from "../../services/staffService";
import "./StaffTicketDetail.css";

const StaffTicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ดึงข้อมูล ticket และ comments เมื่อ component โหลด
  useEffect(() => {
    fetchTicketData();
  }, [ticketId]);

  // Scroll ไปล่างสุดเมื่อมี comment ใหม่
  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ดึงข้อมูล ticket (จะเปลี่ยน status เป็น 'open' อัตโนมัติ)
      const ticketResponse = await getTicketById(ticketId);
      setTicket(ticketResponse.data);

      // ดึง comments
      const commentsResponse = await getTicketComments(ticketId);
      setComments(commentsResponse.data);
    } catch (err) {
      console.error("Error fetching ticket:", err);
      setError(err.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ส่ง comment
  const handleSendComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setSending(true);

      // เรียก API สร้าง comment
      const response = await createComment(ticketId, newComment.trim());

      // เพิ่ม comment ใหม่เข้า list
      setComments([...comments, response.data]);

      // เคลียร์ input
      setNewComment("");

      // รีเฟรช ticket data เพื่ออัปเดต status
      await fetchTicketData();
    } catch (err) {
      console.error("Error sending comment:", err);
      alert("ไม่สามารถส่งข้อความได้: " + (err.message || "เกิดข้อผิดพลาด"));
    } finally {
      setSending(false);
    }
  };

  // 🌟 เปลี่ยน status เป็น Resolved
  const handleResolveTicket = async () => {
    if (!window.confirm("คุณต้องการเปลี่ยนสถานะเป็น Resolved หรือไม่?")) {
      return;
    }

    try {
      setLoading(true);

      // เรียก API อัปเดต status
      await updateTicket(ticketId, { status: "resolved" });

      // รีเฟรชข้อมูล
      await fetchTicketData();

      alert("เปลี่ยนสถานะเป็น Resolved สำเร็จ!");
    } catch (err) {
      console.error("Error resolving ticket:", err);
      alert(
        "ไม่สามารถเปลี่ยนสถานะได้: " + (err.message || "เกิดข้อผิดพลาด")
      );
    } finally {
      setLoading(false);
    }
  };

  // จัดรูปแบบวันที่และเวลา
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // สี priority
  const getPriorityColor = (priority) => {
    const colors = {
      low: "#52c41a",
      medium: "#faad14",
      high: "#fa8c16",
      critical: "#f5222d",
    };
    return colors[priority] || "#999";
  };

  if (loading) {
    return (
      <div className="ticket-detail">
        <div className="loading">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-detail">
        <div className="error">
          <p>⚠️ {error || "ไม่พบข้อมูล Ticket"}</p>
          <button onClick={() => navigate("/staff")}>กลับหน้าแรก</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-detail">
      {/* Header */}
      <header className="detail-header">
        <div className="header-left">
          <h1>IT Support Ticket</h1>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <span>{currentUser.username || "Sara"}</span>
            <span className="dropdown-icon">▼</span>
          </div>
        </div>
      </header>

{/* <div className="navbar-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div
            className="user-info"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">👤</div>
            <span>{username}</span>
            <span className="dropdown-icon">▼</span>

             Dropdown Menu 
            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-item dropdown-user">
                  <strong>{username}</strong>
                  <span className="user-role">Admin</span>
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
      </div> */}


      {/* Ticket Info & Chat Container */}
      <div className="chat-container">
        {/* Ticket Info Bar */}
        <div className="ticket-info-bar">
          {/* Back Button */}
          <div className="back-button-container">
            <button className="back-btn" onClick={() => navigate("/staff")}>
              ← กลับ
            </button>
          </div>
          <div className="info-item">
            <span className="label">Ticket ID:</span>
            <span className="value">{ticket.id}</span>
          </div>
          <div className="info-item">
            <span className="label">STATUS:</span>
            <span className="value status-badge">
              {ticket.status || "Open"}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Priority:</span>
            <span
              className="value priority-badge"
              style={{ color: getPriorityColor(ticket.priority) }}
            >
              {ticket.priority?.charAt(0).toUpperCase() +
                ticket.priority?.slice(1)}
            </span>
          </div>

          {/* 🌟 ปุ่ม Resolve Ticket (แสดงเมื่อ status = in_progress) */}
          {ticket.status === "in_progress" && (
            <div className="info-item">
              <button
                className="resolve-btn"
                onClick={handleResolveTicket}
                disabled={loading}
              >
                ✓ Mark as Resolved
              </button>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {/* 🌟 แสดง Ticket Details เป็น Message แรก */}
          <div className="message user-message ticket-info-message">
            <div className="message-avatar">
              <img
                src={`https://ui-avatars.com/api/?name=${
                  ticket.reporterUsername || "User"
                }&background=random`}
                alt={ticket.reporterUsername}
              />
            </div>
            <div className="message-content ticket-details">
              <div className="message-header">
                <span className="message-author">
                  {ticket.reporterUsername || "User"}
                </span>
                <span className="message-role">Reporter</span>
              </div>
              <div className="ticket-title-section">
                <strong>{ticket.title}</strong>
              </div>
              <div className="ticket-description-section">
                <p>{ticket.description}</p>
              </div>
              <div className="message-time">
                {formatDateTime(ticket.createdAt)}
              </div>
            </div>
          </div>

          {/* 🌟 Divider */}
          {comments.length > 0 && (
            <div className="chat-divider">
              <span>การสนทนา</span>
            </div>
          )}

          {/* Comments */}
          {comments.length === 0 ? (
            <div className="no-messages">
              <p>ยังไม่มีการตอบกลับ</p>
              <p className="hint">เริ่มต้นการสนทนาโดยส่งข้อความด้านล่าง</p>
            </div>
          ) : (
            comments.map((comment, index) => {
              const isStaff = comment.role === "staff";
              const isCurrentUser = comment.userId === currentUser.id;

              return (
                <div
                  key={comment.id || index}
                  className={`message ${
                    isStaff ? "staff-message" : "user-message"
                  } ${isCurrentUser ? "my-message" : ""}`}
                >
                  <div className="message-avatar">
                    <img
                      src={`https://ui-avatars.com/api/?name=${comment.username}&background=random`}
                      alt={comment.username}
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-author">{comment.username}</span>
                      <span className="message-role">
                        {comment.role === "staff" ? "Support Staff" : "User"}
                      </span>
                    </div>
                    <div className="message-text">{comment.content}</div>
                    <div className="message-time">
                      {formatDateTime(comment.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Comment Input */}
        <form className="comment-input-form" onSubmit={handleSendComment}>
          <div className="input-container">
            <input
              type="text"
              className="comment-input"
              placeholder="Type something"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!newComment.trim() || sending}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffTicketDetail;