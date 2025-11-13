import React from 'react';
import { NavLink } from 'react-router-dom';
import './Usernavbar.css';

export default function UserNavbar() {
  return (
    <nav className="user-navbar">
      <NavLink
        to="/user"
        end // 'end' = สำหรับ URL ที่เป็น /user พอดีเท่านั้น
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        Ticket List
      </NavLink>
      <NavLink
        to="/user/new"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        แจ้งปัญหา
      </NavLink>
    </nav>
  );
}