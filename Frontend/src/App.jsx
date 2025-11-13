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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Staff Routes */}
        {/* <Route path="/staff/*" element={<StaffHome />} /> */}
        
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