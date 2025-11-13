import api from './api';

// ดึงสถิติ Dashboard (All Ticket, All User, All Staff)
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

// ดึงรายการ Ticket ทั้งหมด (สำหรับตาราง)
export const getAllTickets = async () => {
  const response = await api.get('/admin/tickets');
  return response.data;
};