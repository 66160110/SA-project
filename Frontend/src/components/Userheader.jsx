import React, { useState, useEffect } from 'react';

// Import 'Link' และ 'useNavigate' จาก 'react-router-dom'
// 'Link' ใช้สำหรับสร้างลิงก์ที่เปลี่ยนหน้าเว็บโดยไม่โหลดใหม่ทั้งหน้า
// 'useNavigate'เครื่องมือ ที่ช่วยให้เราสั่งเปลี่ยนหน้า (redirect) ด้วยโค้ด
import { Link, useNavigate } from 'react-router-dom';


import './UserHeader.css';

// export default function UserHeader() { ... }
// เพื่อให้ไฟล์อื่น (เช่น UserLayout) สามารถ import ไปใช้งานได้
export default function UserHeader() {
  // State เดิม (สำหรับเก็บชื่อ)
  const [userName, setUserName] = useState('User');
  
  // 👇 2. State ใหม่ (สำหรับจำว่า dropdown เปิด/ปิด)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navigate = useNavigate();

  // (useEffect เดิม สำหรับดึงชื่อ user)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserName(userData.username); 
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  // (handleLogout เดิม)
  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');  
    navigate('/login'); 
  };

  // --- 👇 3. ส่วนที่แก้ไข (return) ---
  return (
    <header className="user-header">
      
      {/* (ส่วน header-left เหมือนเดิม) */}
      <div className="header-left">
        <Link to="/user" className="app-logo">
          <h1>IT Support Ticket</h1>
        </Link>
      </div>
      
      {/* 👇 4. รื้อส่วน header-right ใหม่ทั้งหมด */}
      <div className="header-right">
        
        {/* สร้าง "กล่อง" สำหรับ Dropdown */}
        <div className="profile-dropdown">
          
          {/* ปุ่มสีขาวที่แสดงชื่อ (staffGG ▼) */}
          <button 
            className="profile-dropdown-btn" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} // กดเพื่อ เปิด/ปิด
          >
            {userName} 
            <span className="dropdown-arrow">▼</span>
          </button>

          {/* 👇 5. "เมนู" ที่จะโผล่ออกมา (เมื่อ isDropdownOpen == true) */}
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {/* <a className="dropdown-item">โปรไฟล์</a> (เพิ่มทีหลังได้) */}
              
              {/* ปุ่ม Logout ที่อยู่ใน Dropdown */}
              <a 
                className="dropdown-item" 
                onClick={handleLogout}
              >
                ออกจากระบบ
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}