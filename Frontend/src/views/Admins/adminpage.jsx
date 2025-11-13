// ===================================
// AdminPage.jsx - Layout + Router สำหรับ Admin
// ไฟล์: src/views/Admins/adminPage.jsx
// ===================================

import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

function AdminPage() {
  // ตรวจสอบว่าเป็น Admin หรือไม่
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // ถ้าไม่ใช่ Admin → redirect ไป login
  if (user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <Routes>
        {/* หน้า Dashboard เป็นหน้าหลัก */}
        <Route path="/" element={<AdminDashboard />} />
        
        {/* เพิ่ม Route อื่นๆ ในอนาคต (ถ้ามี) */}
        {/* <Route path="/users" element={<AdminUserList />} /> */}
        {/* <Route path="/staffs" element={<AdminStaffList />} /> */}
        
        {/* 404 for admin routes */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}

export default AdminPage;