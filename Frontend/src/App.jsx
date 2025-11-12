// ===================================
// App.jsx - Main Application Router
// ===================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// ✅ Import components ที่มีอยู่แล้ว
import StaffHome from "./views/Staffs/StaffHome.jsx";
import Login from "./views/Auth/Login.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Staff Routes */}
        <Route path="/staff/*" element={<StaffHome />} />
        
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