import React from 'react';
import { Outlet } from 'react-router-dom'; // เราไม่ต้องการ Link ในไฟล์นี้แล้ว

// 1. แก้ไข 'h' ตัวเล็ก เป็น 'H' ตัวใหญ่ (Case-sensitive)
import UserHeader from '../../components/Userheader.jsx'; 
// 2. เพิ่ม Import ของ Navbar ที่ขาดไป
import UserNavbar from '../../components/Usersidebar.jsx'; 

import './UserLayout.css'; 

// นี่คือเวอร์ชันที่ถูกต้อง (มีแค่ฟังก์ชันเดียว)
export default function UserLayout() {
  return (
    <div className="user-layout-container">

      {/* 1. Header (ส่วนหัวสีม่วง) */}
      <UserHeader />

      {/* 2. Navbar (แถบเมนูสีขาว) */}
      <UserNavbar /> 

      {/* 3. พื้นที่เนื้อหา (ที่ Outlet ทำงาน) */}
      <main className="user-content-area">
        <Outlet /> 
      </main>

    </div>
  );
}