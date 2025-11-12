// src/services/authService.js

import api from './api';

/**
 * ฟังก์ชัน Login สำหรับ Staff
 * API: POST /auth/login
 */
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    
    // `response.data` คือ { success: true, data: { token: '...', user: {...} } }

    // 🔽🔽🔽 แก้ไขตรงนี้ 🔽🔽🔽
    // ตรวจสอบจาก `response.data.data.token`
    if (response.data.data && response.data.data.token) {
      
      // 1. บันทึก Token ที่ถูกต้อง
      localStorage.setItem('token', response.data.data.token);
      
      // 2. บันทึก User ที่ถูกต้อง
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
    } else {
      // กรณี API สำเร็จแต่ไม่ส่ง Token (เผื่อไว้)
      throw new Error('Login successful but no token received.');
    }
    
    // คืนค่า `response.data` (เหมือนเดิม)
    return response.data; 

  } catch (error) {
    console.error("Login failed:", error);
    throw error; // ส่ง Error ต่อให้ Login.jsx
  }
};

/**
 * ฟังก์ชัน Logout
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};