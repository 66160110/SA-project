// ===================================
// Login Component - หน้า Login สำหรับ Staff/Admin
// ===================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // เรียกใช้ login function จาก authService
      const data = await login(username, password);
      
      // 🔽🔽🔽 แก้ไขบรรทัดนี้ 🔽🔽🔽
      console.log('✅ Login successful:', data); // เปลี่ยนจาก data.user เป็น data
      
      // 🔽🔽🔽 และแก้ไขบรรทัดนี้ 🔽🔽🔽
      const userRole = data.role; // เปลี่ยนจาก data.user.role เป็น data.role
      
      if (userRole === 'staff' || userRole === 'admin') {
        navigate('/staff');
      } else if (userRole === 'user') {
        navigate('/user');
      } else {
        navigate('/staff'); // default
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🎫 IT Ticket Support</h1>
          <p>Staff Login Portal</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>🔒 Secure Login Portal</p>
        </div>
      </div>
    </div>
  );
}