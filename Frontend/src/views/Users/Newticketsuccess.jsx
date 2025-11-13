import React from 'react';
import { Link } from 'react-router-dom';
import './Newticketsuccess.css'; // เราจะสร้าง CSS นี้

export default function NewTicketSuccess() {
  return (
    <div className="success-container">
      <div className="success-box">
        <div className="success-icon">
          <span>✓</span> {/* นี่คือเครื่องหมาย Check */}
        </div>
        <h2>ส่งฟอร์มรายงานสำเร็จ</h2>
        <p>
          ข้อมูลของคุณถูกส่งไปยังเจ้าหน้าที่แล้ว 
          คุณสามารถติดตามสถานะได้ที่หน้า Ticket List
        </p>
        <Link to="/user" className="btn-back-home">
          กลับไปหน้าหลัก
        </Link>
      </div>
    </div>
  );
}