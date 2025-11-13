import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Chatticket.css'; // (เช็คว่าชื่อ .css ถูกต้อง)

// (ฟังก์ชัน Avatar - เหมือนเดิม)
const getAvatarInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length > 1 && parts[1].length > 0) { 
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function TicketDetail() {
  const { id: bugId } = useParams();
  const navigate = useNavigate();
  const chatBoxRef = useRef(null); // (สำหรับ Auto-Scroll)

  // (States, Token, User - เหมือนเดิม)
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // (useEffect [comments] สำหรับ Auto-Scroll - เหมือนเดิม)
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [comments]); 

  // (useEffect [bugId] สำหรับดึงข้อมูล - เหมือนเดิม)
  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!token || !currentUser) {
        setError("Please log in again."); setLoading(false); return;
      }
      try {
        setLoading(true);
        const ticketRes = await axios.get(
          `http://localhost:3000/api/bugs/${bugId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setTicket(ticketRes.data.data);
        const commentsRes = await axios.get(
          `http://localhost:3000/api/bugs/${bugId}/comments`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setComments(commentsRes.data.data);
      } catch (err) {
        console.error("Failed to fetch details:", err); 
        setError("Failed to load ticket details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTicketDetails();
  }, [bugId, token, currentUser.id]);

  // (ฟังก์ชันส่งแชท - เหมือนเดิม)
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    setSending(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/bugs/${bugId}/comments`,
        { content: newComment },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setComments([...comments, response.data.data]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to send comment:", err);
      alert("Failed to send comment.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Loading details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!ticket) return <div>Ticket not found.</div>;

  // --- 👇 นี่คือ JSX ที่แก้ไขแล้ว ---
  return (
    <div className="ticket-detail-layout"> {/* 👈 1. ตัวคุม "Fit จอ" */}
      
      {/* 2. ส่วนหัว (Header) - แก้ไขโครงสร้าง */}
      <div className="ticket-detail-header">
        
        <div className="header-bottom-row">{/* 👈 3. ย้าย Info มาบรรทัดล่าง */}
          <button onClick={() => navigate('/user')} className="back-btn">
            ← กลับ
          </button>
          <span>TICKET ID: {ticket.id}</span>
          <span>STATUS: <span className={`status-pill ${ticket.status || 'New'}`}>{ticket.status || 'New'}</span></span>
          <span>PRIORITY: <span className={`priority-pill ${ticket.priority}`}>{ticket.priority}</span></span>
        </div>
      </div>

      {/* 3. กล่องแชท (ที่ Scroll ได้) */}
      <div ref={chatBoxRef} className="chat-box"> 
        
        {/* โพสต์แรก (Description) - ขวา/ม่วง */}
        {/* 👇 4. (จุดที่แก้สำคัญ!) เปลี่ยนเป็น "my-message" (ขวา/ม่วง) */}
        <div className="chat-message my-message"> 
          {/* (สลับที่ Bubble กับ Avatar) */}
          <div className="message-bubble">
            <div className="message-sender">{ticket.reporterUsername} (Reporter)</div>
            <div className="message-content">{ticket.description}</div>
            <div className="message-time">{new Date(ticket.createdAt).toLocaleString()}</div>
          </div>
          <div className="avatar my-avatar">
            {getAvatarInitials(ticket.reporterUsername)}
          </div>
        </div>

        {/* ลูป Comments (แชทอื่นๆ) */}
        {comments.map((comment) => {
          const isMyMessage = comment.userId === currentUser.id;
          
          return (
            <div 
              key={comment.id}
              className={`chat-message ${isMyMessage ? 'my-message' : 'their-message'}`}
            >
              {/* --- โครงสร้าง Staff (ซ้าย) --- */}
              {!isMyMessage && (
                <>
                  <div className="avatar their-avatar">
                    {getAvatarInitials(comment.username)}
                  </div>
                  <div className="message-bubble">
                    <div className="message-sender">
                      {comment.username}
                      {/* (เพิ่ม (Staff) ถ้า API ส่ง isStaff มา) */}
                      {comment.isStaff && <span> (Staff)</span>} 
                    </div>
                    <div className="message-content">{comment.content}</div>
                    <div className="message-time">{new Date(comment.createdAt).toLocaleString()}</div>
                  </div>
                </>
              )}
              
              {/* --- 👇 5. (จุดแก้บั๊ก!) โครงสร้าง User (ขวา) --- */}
              {isMyMessage && (
                <>
                  {/* (สลับที่ Bubble กับ Avatar ให้เหมือนโพสต์แรก) */}
                  <div className="message-bubble">
                    <div className="message-sender">{comment.username}</div>
                    <div className="message-content">{comment.content}</div>
                    <div className="message-time">{new Date(comment.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="avatar my-avatar">
                    {getAvatarInitials(comment.username)}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. ช่องพิมพ์ */}
      <form onSubmit={handleCommentSubmit} className="chat-input-form">
        <input
          type="text"
          value={newComment}
          // 👇 6. (จุดแก้บั๊ก!) แก้ e.g.value เป็น e.target.value
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type something..."
          disabled={sending}
        />
        <button type="submit" disabled={sending}>
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}