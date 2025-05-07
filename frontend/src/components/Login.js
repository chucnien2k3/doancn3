
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mat_khau: matKhau }),
      });
      const data = await response.json();
      if (response.ok) {
        // Lưu token và vai trò vào localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('vai_tro', data.vai_tro);
        alert('Đăng nhập thành công!');
        // Chuyển hướng dựa trên vai trò
        if (data.vai_tro === 'khach_hang') {
          navigate('/dashboard/khach-hang');
        } else if (data.vai_tro === 'nhan_vien') {
          navigate('/dashboard/nhan-vien');
        } else if (data.vai_tro === 'quan_tri') {
          navigate('/dashboard/quan-tri');
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="login-container">
      <div className="logo">
        <h1>SACHISUSA CAR SERVICE</h1>
      </div>
      <div className="login-box">
        <h2>ĐĂNG NHẬP</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
            />
          </div>
          <div className="form-options">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>
          </div>
          <button type="submit">Đăng Nhập</button>
        </form>
        <p>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;