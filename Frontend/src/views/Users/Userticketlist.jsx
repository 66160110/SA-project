import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // 1. Import axios
import './Userticketlist.css'; // เราจะสร้างไฟล์นี้เพื่อความสวยงาม



export default function UserTicketList() {
  // 2. สร้าง "กล่อง" (State) ไว้เก็บข้อมูล Tickets และสถานะ Loading
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  // 3. useEffect จะทำงาน "ครั้งเดียว" ตอนหน้าเว็บนี้โหลดเสร็จ
  useEffect(() => {
    // สร้างฟังก์ชันสำหรับดึงข้อมูล
    const fetchTickets = async () => {
      try {
        setLoading(true); // เริ่มโหลด...

        // 👇 1. ดึง "Token" (ตั๋ว) ที่เราเก็บไว้ ออกมาจาก localStorage
        const token = localStorage.getItem('token');

        // 👇 2. ตรวจสอบว่ามี Token หรือไม่
        if (!token) {
          setError('ไม่พบ Token, กรุณา Login ใหม่อีกครั้ง');
          setLoading(false);
          return; // หยุดทำงาน ถ้าไม่มี Token
        }
    
        // "ยิง" API ไปที่ Backend
        // ‼️ (สำคัญ) แก้ URL นี้ให้ตรงกับ Backend ของคุณ
        const response = await axios.get(
          'http://localhost:3000/api/bugs', // URL ที่ยิง
          {
            // เพิ่ม config object เพื่อส่ง "headers"
            headers: {
              'Authorization': `Bearer ${token}` // นี่คือการ "ยื่นตั๋ว"
            },
            params: {
              sort: sortOrder // (จะส่ง ?sort=newest หรือ ?sort=oldest ไป)
            }
          }
        );
        
        // เอาข้อมูลที่ได้ (จากตาราง Bugs) ใส่ในกล่อง (State)
        // (สมมติว่า API ของคุณส่งกลับมาใน { data: [...] } )
        setTickets(response.data.data || response.data); 

      } catch (err) {
        // ถ้า Error (เช่น Backend ปิดอยู่)
        console.error('Failed to fetch tickets:', err);
        setError('Failed to load tickets. Please try again later.');
      } finally {
        // ไม่ว่าจะสำเร็จหรือล้มเหลว ก็ให้ "เลิกโหลด"
        setLoading(false);
      }
    };

    fetchTickets(); // สั่งให้ฟังก์ชันนี้ทำงาน
  }, [sortOrder]); // [] หมายถึง "ทำงานแค่ครั้งเดียวตอนโหลด"

  // --- ส่วนแสดงผล (Render) ---

  // ถ้ากำลังโหลด...
  if (loading) {
    return <div className="loading-message">Loading tickets...</div>;
  }

  // ถ้า Error...
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // ถ้าโหลดเสร็จ และไม่มี Error...
  return (
    <div className="ticket-list-container">
      {/* ส่วนหัวของตาราง (ตัวกรอง "Newest") */}
      <div className="ticket-list-header">
        <h3>All Tickets ({tickets.length})</h3>
        <select className="filter-dropdown"
          value={sortOrder} // 👈 1. เพิ่ม value
          onChange={(e) => setSortOrder(e.target.value)} // 👈 2. เพิ่ม onChange
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* ตารางแสดงผล */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>หมายเหตุ</th> {/* 👈 1. เพิ่มคอลัมน์นี้ */}
            <th>หมวดหมู่</th>
            <th>สถานะ</th>
            <th>ระดับความร้ายแรง</th>
            <th>เวลาที่สร้าง</th>
            <th>รายละเอียด</th>
          </tr>
        </thead>

        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                ยังไม่มี Ticket ที่คุณรายงาน
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => {

              // เราจะสร้างตัวแปรนี้ขึ้นมาก่อน
              const displayStatus = ticket.status || 'New';

              // เพิ่ม Logic การตัดคำ (12 ตัวอักษร)
              const truncatedDesc = ticket.description 
                ? (ticket.description.length > 12 
                    ? ticket.description.substring(0, 12) + '...' 
                    : ticket.description)
                : ''; // (ถ้า description เป็น null ให้แสดงค่าว่าง)

              return (
                <tr key={ticket.id}> 
                  <td>{ticket.id}</td>
                  {/* เพิ่ม "เซลล์" ใหม่สำหรับแสดงผล */}
                  <td>{truncatedDesc}</td>
                  <td>{ticket.title}</td>


                  {/* 👇 2. ใช้ตัวแปร displayStatus ทั้ง 2 ที่ */}
                  <td>
                    <span className={`status ${displayStatus}`}>
                      {displayStatus} 
                    </span>
                  </td>

                  <td>
                    <span className={`priority ${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                  </td>

                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td> 

                  <td>
                    {/* (อันนี้คือโค้ดจาก "ขั้นตอนหน้า Chat" ที่เราทำไปแล้ว) */}
                    <Link 
                      to={`/user/ticket/${ticket.id}`} 
                      className="btn-view-details"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            }) // ปิด .map
          )}
        </tbody>
      </table>
    </div>
  );
}