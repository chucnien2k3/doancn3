import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import DashboardKhachHang from './components/DashboardKhachHang';
import DashboardNhanVien from './components/DashboardNhanVien';
import DashboardQuanTri from './components/DashboardQuanTri';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Thêm route tạm thời cho dashboard để kiểm tra chuyển hướng */}
          <Route path="/dashboard/khach-hang" element={<DashboardKhachHang />} />
          <Route path="/dashboard/nhan-vien" element={<DashboardNhanVien />} />
          <Route path="/dashboard/quan-tri" element={<DashboardQuanTri />} />
          <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;