import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

function DashboardNhanVien() {
  const [lichHens, setLichHens] = useState([]);
  const [thongBaos, setThongBaos] = useState([]);
  const [chiTietBaoDuong, setChiTietBaoDuong] = useState(null);
  const [userInfo, setUserInfo] = useState({ email: '', ho_va_ten: '', vai_tro: '' }); // Thêm state để lưu thông tin nhân viên
  const [activeTab, setActiveTab] = useState('tong_quan');
  const [trangThaiFilter, setTrangThaiFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [lichHenRes, thongBaoRes, userInfoRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/dashboard/nhan-vien/lich-hen', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://127.0.0.1:5000/dashboard/nhan-vien/thong-bao', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://127.0.0.1:5000/dashboard/nhan-vien/thong-tin', { // Gọi API lấy thông tin nhân viên
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (!lichHenRes.ok) throw new Error('Lỗi khi lấy danh sách lịch hẹn');
        if (!thongBaoRes.ok) throw new Error('Lỗi khi lấy danh sách thông báo');
        if (!userInfoRes.ok) throw new Error('Lỗi khi lấy thông tin nhân viên');

        const [lichHenData, thongBaoData, userInfoData] = await Promise.all([
          lichHenRes.json(),
          thongBaoRes.json(),
          userInfoRes.json(),
        ]);

        setLichHens(Array.isArray(lichHenData) ? lichHenData : []);
        setThongBaos(Array.isArray(thongBaoData) ? thongBaoData : []);
        setUserInfo(userInfoData); // Lưu thông tin nhân viên vào state
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCapNhatTrangThai = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:5000/lich-hen/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trang_thai: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi khi cập nhật trạng thái lịch hẹn');
      }

      const data = await res.json();
      alert(data.message);

      const lichHenRes = await fetch('http://127.0.0.1:5000/dashboard/nhan-vien/lich-hen', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!lichHenRes.ok) throw new Error('Lỗi khi lấy danh sách lịch hẹn');
      const lichHenData = await lichHenRes.json();
      setLichHens(Array.isArray(lichHenData) ? lichHenData : []);
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err.message);
      alert(err.message);
    }
  };

  const handleGhiChiTietBaoDuong = async (lichHenId) => {
    if (
      !chiTietBaoDuong ||
      !chiTietBaoDuong.phu_tung_da_dung ||
      !chiTietBaoDuong.thoi_gian_thuc_te ||
      !chiTietBaoDuong.bao_gia
    ) {
      alert('Vui lòng nhập đầy đủ thông tin chi tiết bảo dưỡng!');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:5000/lich-hen/${lichHenId}/bao-duong`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chiTietBaoDuong),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi khi ghi chi tiết bảo dưỡng');
      }

      const data = await res.json();
      alert(data.message);
      setChiTietBaoDuong(null);
    } catch (err) {
      console.error('Lỗi khi ghi chi tiết bảo dưỡng:', err.message);
      alert(err.message);
    }
  };

  const filteredLichHens = trangThaiFilter
    ? lichHens.filter((lh) => lh.trang_thai === trangThaiFilter)
    : lichHens;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLichHens = filteredLichHens.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLichHens.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    return timeString;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTrangThai = (trangThai) => {
    switch (trangThai) {
      case 'dang_cho':
        return 'Đang chờ';
      case 'da_hoan_thanh':
        return 'Đã hoàn thành';
      case 'da_huy':
        return 'Đã hủy';
      case 'da_xac_nhan':
        return 'Đã xác nhận';
      default:
        return trangThai;
    }
  };

  const renderMainContent = () => {
    if (loading) {
      return <div className="p-4">Đang tải dữ liệu...</div>;
    }

    if (error) {
      return <div className="p-4 text-danger">Lỗi: {error}</div>;
    }

    switch (activeTab) {
      case 'tong_quan':
        return (
          <div className="p-4 tab-content">
            <h4 className="mb-4">Tổng quan</h4>
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Tổng số lịch hẹn</h5>
                    <p className="card-text display-4">{lichHens.length}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Lịch hẹn đã hoàn thành</h5>
                    <p className="card-text display-4">
                      {lichHens.filter((lh) => lh.trang_thai === 'da_hoan_thanh').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h5>Chào mừng</h5>
              <p>Chào mừng bạn đến với dashboard nhân viên! Quản lý lịch làm việc một cách hiệu quả.</p>
            </div>
          </div>
        );
      case 'lich_lam_viec':
        return (
          <div className="p-4 tab-content">
            <h4 className="mb-3">Lịch làm việc</h4>
            {chiTietBaoDuong && (
              <div className="mb-4 p-3 border rounded">
                <h5 className="mb-3">Ghi chi tiết bảo dưỡng</h5>
                <div className="mb-2">
                  <label className="form-label">Phụ tùng đã dùng:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={chiTietBaoDuong.phu_tung_da_dung || ''}
                    onChange={(e) =>
                      setChiTietBaoDuong({ ...chiTietBaoDuong, phu_tung_da_dung: e.target.value })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Thời gian thực tế (phút):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={chiTietBaoDuong.thoi_gian_thuc_te || ''}
                    onChange={(e) =>
                      setChiTietBaoDuong({ ...chiTietBaoDuong, thoi_gian_thuc_te: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Ghi chú:</label>
                  <textarea
                    className="form-control"
                    value={chiTietBaoDuong.ghi_chu || ''}
                    onChange={(e) => setChiTietBaoDuong({ ...chiTietBaoDuong, ghi_chu: e.target.value })}
                  ></textarea>
                </div>
                <div className="mb-2">
                  <label className="form-label">Báo giá (VND):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={chiTietBaoDuong.bao_gia || ''}
                    onChange={(e) =>
                      setChiTietBaoDuong({ ...chiTietBaoDuong, bao_gia: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => handleGhiChiTietBaoDuong(chiTietBaoDuong.lich_hen_id)}
                  >
                    Lưu
                  </button>
                  <button className="btn btn-secondary" onClick={() => setChiTietBaoDuong(null)}>
                    Hủy
                  </button>
                </div>
              </div>
            )}
            <div className="mb-2">
              <label className="form-label">Lọc theo trạng thái:</label>
              <select
                className="form-select"
                value={trangThaiFilter}
                onChange={(e) => {
                  setTrangThaiFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả</option>
                <option value="da_xac_nhan">Đã xác nhận</option>
                <option value="da_hoan_thanh">Đã hoàn thành</option>
                <option value="da_huy">Đã hủy</option>
              </select>
            </div>
            {filteredLichHens.length === 0 ? (
              <p>Chưa có lịch hẹn nào.</p>
            ) : (
              <div>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Dịch vụ</th>
                        <th>Khung giờ</th>
                        <th>Ngày hẹn</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLichHens.map((lh) => (
                        <tr key={lh.id}>
                          <td>{lh.id}</td>
                          <td>{lh.khach_hang?.email || 'N/A'}</td>
                          <td>{lh.dich_vu?.ten_dich_vu || 'N/A'}</td>
                          <td>
                            {lh.khung_gio?.thoi_gian_bat_dau && lh.khung_gio?.thoi_gian_ket_thuc
                              ? `${formatTime(lh.khung_gio.thoi_gian_bat_dau)} - ${formatTime(lh.khung_gio.thoi_gian_ket_thuc)}`
                              : 'Không xác định'}
                          </td>
                          <td>{lh.ngay_hen ? formatDate(lh.ngay_hen) : 'N/A'}</td>
                          <td>{formatTrangThai(lh.trang_thai)}</td>
                          <td>
                            {lh.trang_thai === 'da_xac_nhan' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success me-1"
                                  onClick={() => handleCapNhatTrangThai(lh.id, 'da_hoan_thanh')}
                                >
                                  Hoàn thành
                                </button>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() =>
                                    setChiTietBaoDuong({
                                      lich_hen_id: lh.id,
                                      phu_tung_da_dung: '',
                                      thoi_gian_thuc_te: 0,
                                      ghi_chu: '',
                                      bao_gia: 0,
                                    })
                                  }
                                >
                                  Ghi chi tiết
                                </button>
                              </>
                            )}
                            {lh.trang_thai === 'da_hoan_thanh' && <span>Đã hoàn thành</span>}
                            {lh.trang_thai === 'da_huy' && <span>Đã hủy</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <nav>
                  <ul className="pagination justify-content-center">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                      >
                        <button className="page-link" onClick={() => paginate(index + 1)}>
                          {index + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}
          </div>
        );
      case 'thong_bao':
        return (
          <div className="p-4 tab-content">
            <h4 className="mb-3">Thông báo</h4>
            {thongBaos.length === 0 ? (
              <p>Chưa có thông báo nào.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Loại</th>
                      <th>Nội dung</th>
                      <th>Thời gian gửi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thongBaos.map((tb) => (
                      <tr key={tb.id}>
                        <td>{tb.id}</td>
                        <td>{tb.loai_thong_bao}</td>
                        <td>{tb.noi_dung}</td>
                        <td>{tb.thoi_gian_gui ? new Date(tb.thoi_gian_gui).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'tai_khoan':
        return (
          <div className="p-4 tab-content">
            <h4 className="mb-3">Tài khoản</h4>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Thông tin tài khoản</h5>
                <p className="card-text">
                  <strong>Email:</strong> {userInfo.email || 'N/A'}
                </p>
                <p className="card-text">
                  <strong>Họ và tên:</strong> {userInfo.ho_va_ten || 'N/A'}
                </p>
                <p className="card-text">
                  <strong>Vai trò:</strong> {userInfo.vai_tro === 'nhan_vien' ? 'Nhân viên' : 'N/A'}
                </p>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/');
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const SidebarContent = () => (
    <>
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Quản lý lịch làm việc</h5>
        <button
          type="button"
          className="btn-close d-md-none"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <div className="mb-4">
          <p className="text-muted">{userInfo.email || 'N/A'}</p>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'tong_quan' ? 'active' : ''}`}
              onClick={() => setActiveTab('tong_quan')}
            >
              Tổng quan
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'lich_lam_viec' ? 'active' : ''}`}
              onClick={() => setActiveTab('lich_lam_viec')}
            >
              Lịch làm việc
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'thong_bao' ? 'active' : ''}`}
              onClick={() => setActiveTab('thong_bao')}
            >
              Thông báo
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'tai_khoan' ? 'active' : ''}`}
              onClick={() => setActiveTab('tai_khoan')}
            >
              Tài khoản
            </button>
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <div className="d-flex">
      <div className="d-none d-md-block sidebar">
        <SidebarContent />
      </div>

      <div className="offcanvas offcanvas-start d-md-none" id="sidebar" tabIndex="-1">
        <SidebarContent />
      </div>

      <div className="flex-grow-1">
        <button
          className="btn btn-primary d-md-none m-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebar"
          aria-controls="sidebar"
        >
          <i className="bi bi-list"></i>
        </button>
        <div className="p-3">
          <h3>Dashboard Nhân Viên</h3>
        </div>
        {renderMainContent()}
      </div>
    </div>
  );
}

export default DashboardNhanVien;