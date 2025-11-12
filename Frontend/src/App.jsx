// ===================================
// App.jsx - Main Application Router
// ===================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// ✅ Import components ที่มีอยู่แล้ว
import StaffHome from "./views/Staffs/StaffHome.jsx";
import Login from "./views/Auth/Login.jsx";

// Import หน้า Ticket Detail เข้ามา
import StaffTicketDetail from "./views/Staffs/StaffTicketDetail.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
       {/* Staff Routes */}
        
        {/* path="/staff"  สำหรับหน้าตาราง StaffHome */}
        <Route path="/staff" element={<StaffHome />} /> 
        
        {/* path="/staff/tickets/:ticketId" สำหรับหน้าดูรายละเอียด */}
        <Route 
          path="/staff/tickets/:ticketId" 
          element={<StaffTicketDetail />} 
        />

        {/* Default Route - Redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 Not Found */}
        <Route 
          path="*" 
          element={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              fontSize: '24px',
              color: '#666'
            }}>
              404 - Page Not Found
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;