import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [hoVaTen, setHoVaTen] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          so_dien_thoai: soDienThoai,
          mat_khau: matKhau,
          ho_va_ten: hoVaTen,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/');
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
        <h2>ĐĂNG KÝ</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={hoVaTen}
              onChange={(e) => setHoVaTen(e.target.value)}
              required
            />
          </div>
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
            <label>Số điện thoại</label>
            <input
              type="text"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
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
          <button type="submit">Đăng Ký</button>
        </form>
        <p>
          Đã có tài khoản? <Link to="/">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;