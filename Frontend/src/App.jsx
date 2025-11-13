// ===================================
// App.jsx - Main Application Router
// ===================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Import components
import Login from "./views/Auth/Login.jsx";
// import StaffHome from "./views/Staffs/StaffHome.jsx";
import AdminPage from "./views/Admins/adminpage.jsx"; // 🆕 เพิ่ม Admin

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes - 🆕 เพิ่มส่วนนี้ */}
        <Route path="/admin/*" element={<AdminPage />} />
        
        {/* Staff Routes */}
        {/* <Route path="/staff/*" element={<StaffHome />} /> */}
        
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
              color: '#666',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
              <a href="/login" style={{ color: '#4a1175', textDecoration: 'underline' }}>
                Go to Login
              </a>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;