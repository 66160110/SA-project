// ===================================
// Staff Service - API Calls สำหรับ Staff
// ไฟล์: src/services/staffService.js
// ===================================

import api from './api';

/**
 * 📋 ดึงรายการ tickets ทั้งหมดที่ staff รับผิดชอบ
 * - รวมถึง tickets ที่ยังไม่มีคนรับผิดชอบ (assigneeId = NULL)
 * - สามารถ filter ตาม status, priority ได้
 */
export const getStaffTickets = async (params = {}) => {
  try {
    const response = await api.get('/bugs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 🔍 ดูรายละเอียด ticket ตาม ID
 * - เมื่อ staff ดู → status จะเปลี่ยนเป็น 'open' อัตโนมัติ (ถ้า status = NULL)
 * - staff จะถูก assign อัตโนมัติ (ถ้า assigneeId = NULL)
 */
export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/bugs/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ✏️ แก้ไข ticket (PATCH)
 * - Staff แก้ได้เฉพาะ: status, priority, assigneeId
 */
export const updateTicket = async (ticketId, updates) => {
  try {
    const response = await api.patch(`/bugs/${ticketId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 💬 ดึงความคิดเห็นทั้งหมดของ ticket
 */
export const getTicketComments = async (ticketId) => {
  try {
    const response = await api.get(`/bugs/${ticketId}/comments`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 📝 สร้าง comment ใหม่
 * - เมื่อ staff comment → status จะเปลี่ยนเป็น 'in_progress' อัตโนมัติ
 */
export const createComment = async (ticketId, content) => {
  try {
    const response = await api.post(`/bugs/${ticketId}/comments`, { content });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 🗑️ ลบ comment
 * - Staff ลบได้เฉพาะ comment ของตัวเอง
 */
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 📊 ดึงข้อมูล metadata (statuses, priorities, users)
 */
export const getMetadata = async () => {
  try {
    const [statuses, priorities, users] = await Promise.all([
      api.get('/statuses'),
      api.get('/priorities'),
      api.get('/users'),
    ]);

    return {
      statuses: statuses.data.data,
      priorities: priorities.data.data,
      users: users.data.data,
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 📈 ดึงสถิติ tickets (สำหรับ dashboard)
 */
export const getTicketStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};