import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Newticketform.css'; // เราจะสร้าง CSS นี้ถัดไป

export default function NewTicketForm() {
  // State สำหรับเก็บข้อมูล User ที่ Login
  const [userData, setUserData] = useState({ username: '', email: '' });
  
  // State สำหรับข้อมูลในฟอร์ม
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low'); // ค่าเริ่มต้น
  
  // State สำหรับการ Submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // ดึงข้อมูล User (ที่เก็บไว้ตอน Login) มาแสดง
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  // ฟังก์ชันเมื่อกดปุ่ม "ส่ง" (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันหน้าเว็บโหลดใหม่
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication error. Please log in again.');
      setLoading(false);
      return;
    }

    // ข้อมูลที่จะส่งไป (ต้องตรงกับที่ bugController ต้องการ)
    const newTicketData = {
      title,
      description,
      priority
    };

    try {
      // ยิง API (POST) เพื่อสร้าง Ticket
      await axios.post(
        'http://localhost:3000/api/bugs', 
        newTicketData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // ถ้าสำเร็จ: พาไปหน้า "Success"
      navigate('/user/new/success');

    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError(err.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        
        {/* === ส่วนข้อมูลผู้ใช้งาน (Disabled) === */}
        <div className="form-section">
          <h2>ข้อมูลผู้ใช้งาน</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">ชื่อจริง</label>
              <input 
                type="text" 
                id="username" 
                value={userData.username} 
                disabled 
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">อีเมล</label>
              <input 
                type="email" 
                id="email" 
                value={userData.email || 'N/A'} 
                disabled 
              />
            </div>
            {/* (คุณสามารถเพิ่ม "นามสกุล" "เบอร์โทร" ที่นี่ได้ ถ้ามีใน userData) */}
          </div>
        </div>

        {/* === ส่วนข้อมูลปัญหา === */}
        <div className="form-section">
          <h2>ข้อมูลปัญหา</h2>
          <div className="form-group">
            <label htmlFor="title">หัวข้อ*</label>
            <input 
              type="text" 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">รายละเอียด*</label>
            <textarea 
              id="description"
              rows="6"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>ระดับความรุนแรง*</label>
            <div className="radio-group">
              <label>
                <input type="radio" value="low" checked={priority === 'low'} onChange={() => setPriority('low')} />
                Low
              </label>
              <label>
                <input type="radio" value="medium" checked={priority === 'medium'} onChange={() => setPriority('medium')} />
                Medium
              </label>
              <label>
                <input type="radio" value="high" checked={priority === 'high'} onChange={() => setPriority('high')} />
                High
              </label>
            </div>
          </div>
        </div>
        
        {/* === ปุ่ม Submit === */}
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/user')}>
            ยกเลิก
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'กำลังส่ง...' : 'ส่งข้อมูล'}
          </button>
        </div>

      </form>
    </div>
  );
}