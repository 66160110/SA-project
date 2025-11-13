// ===================================
// App.jsx - Main Application Router
// ===================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// ✅ Import components ที่มีอยู่แล้ว
// import StaffHome from "./views/Staffs/StaffHome.jsx";
import Login from "./views/Auth/Login.jsx";
import UserLayout from './views/Users/UserLayout.jsx';
import UserTicketList from './views/Users/Userticketlist.jsx';
import NewTicketForm from './views/Users/Newticketform.jsx';
import NewTicketSuccess from './views/Users/Newticketsuccess.jsx';
import ChatTicket from './views/Users/Chatticket.jsx';
// Import components
import StaffHome from "./views/Staffs/StaffHome.jsx";
import AdminPage from "./views/Admins/adminpage.jsx"; // 🆕 เพิ่ม Admin

// Import หน้า Ticket Detail เข้ามา
import StaffTicketDetail from "./views/Staffs/StaffTicketDetail.jsx";

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

        {/* ===== USER ROUTES (ที่เราเพิ่งเพิ่ม) ===== */}
        <Route path="/user" element={<UserLayout />}>
          {/* 'index' หมายถึงหน้าแรกของ /user */}
          <Route index element={<UserTicketList />} /> 
          {/* New ticket */}
          <Route path="new" element={<NewTicketForm />} />
          {/* New ticket success */}
          <Route path="new/success" element={<NewTicketSuccess />} />
          {/* 👇 2. เช็คว่ามีบรรทัดนี้แล้ว */}
          <Route path="ticket/:id" element={<ChatTicket />} />
        </Route>
        
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