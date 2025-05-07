import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

function DashboardKhachHang() {
  const [lichHens, setLichHens] = useState([]);
  const [thongBaos, setThongBaos] = useState([]);
  const [dichVus, setDichVus] = useState([]);
  const [khungGios, setKhungGios] = useState([]);
  const [garas, setGaras] = useState([]);
  const [newLichHen, setNewLichHen] = useState({ dich_vu_id: '', khung_gio_id: '', gara_id: '', ngay_hen: '' });
  const [editingLichHen, setEditingLichHen] = useState(null);
  const [userInfo, setUserInfo] = useState({ email: '', ho_va_ten: '', vai_tro: '' });
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

    document.body.classList.add('dark-theme');

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [dichVuRes, khungGioRes, garaRes, lichHenRes, thongBaoRes, userInfoRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/dich-vu'),
          fetch('http://127.0.0.1:5000/khung-gio'),
          fetch('http://127.0.0.1:5000/gara'),
          fetch('http://127.0.0.1:5000/dashboard/khach-hang/lich-hen', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://127.0.0.1:5000/dashboard/khach-hang/thong-bao', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://127.0.0.1:5000/dashboard/khach-hang/thong-tin', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (!dichVuRes.ok) throw new Error('Lỗi khi lấy danh sách dịch vụ');
        if (!khungGioRes.ok) throw new Error('Lỗi khi lấy danh sách khung giờ');
        if (!garaRes.ok) throw new Error('Lỗi khi lấy danh sách gara');
        if (!lichHenRes.ok) throw new Error('Lỗi khi lấy danh sách lịch hẹn');
        if (!thongBaoRes.ok) throw new Error('Lỗi khi lấy danh sách thông báo');
        if (!userInfoRes.ok) throw new Error('Lỗi khi lấy thông tin người dùng');

        const [dichVuData, khungGioData, garaData, lichHenData, thongBaoData, userInfoData] = await Promise.all([
          dichVuRes.json(),
          khungGioRes.json(),
          garaRes.json(),
          lichHenRes.json(),
          thongBaoRes.json(),
          userInfoRes.json(),
        ]);

        setDichVus(Array.isArray(dichVuData) ? dichVuData : []);
        setKhungGios(Array.isArray(khungGioData) ? khungGioData : []);
        setGaras(Array.isArray(garaData) ? garaData : []);
        setLichHens(Array.isArray(lichHenData) ? lichHenData : []);
        setThongBaos(Array.isArray(thongBaoData) ? thongBaoData : []);
        setUserInfo(userInfoData);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDatLich = async () => {
    if (!newLichHen.dich_vu_id || !newLichHen.khung_gio_id || !newLichHen.gara_id || !newLichHen.ngay_hen) {
      alert('Vui lòng chọn dịch vụ, khung giờ, gara và ngày hẹn!');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://127.0.0.1:5000/dashboard/khach-hang/lich-hen', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLichHen),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi khi đặt lịch');
      }

      const data = await res.json();
      alert(data.message);

      const lichHenRes = await fetch('http://127.0.0.1:5000/dashboard/khach-hang/lich-hen', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!lichHenRes.ok) throw new Error('Lỗi khi lấy danh sách lịch hẹn');
      const lichHenData = await lichHenRes.json();
      setLichHens(Array.isArray(lichHenData) ? lichHenData : []);

      setNewLichHen({ dich_vu_id: '', khung_gio_id: '', gara_id: '', ngay_hen: '' });
    } catch (err) {
      console.error('Lỗi khi đặt lịch:', err.message);
      alert(err.message);
    }
  };

  const handleChinhSua = (lichHen) => {
    setEditingLichHen({
      id: lichHen.id,
      dich_vu_id: lichHen.dich_vu_id.toString(),
      khung_gio_id: lichHen.khung_gio_id.toString(),
      gara_id: lichHen.gara_id ? lichHen.gara_id.toString() : '',
      ngay_hen: lichHen.ngay_hen ? new Date(lichHen.ngay_hen).toISOString().split('T')[0] : '',
    });
  };

  const handleCapNhatLichHen = async () => {
    if (!editingLichHen.dich_vu_id || !editingLichHen.khung_gio_id || !editingLichHen.gara_id || !editingLichHen.ngay_hen) {
      alert('Vui lòng chọn dịch vụ, khung giờ, gara và ngày hẹn!');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:5000/lich-hen/${editingLichHen.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dich_vu_id: parseInt(editingLichHen.dich_vu_id),
          khung_gio_id: parseInt(editingLichHen.khung_gio_id),
          gara_id: parseInt(editingLichHen.gara_id),
          ngay_hen: editingLichHen.ngay_hen,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi khi chỉnh sửa lịch hẹn');
      }

      const data = await res.json();
      alert(data.message);

      const lichHenRes = await fetch('http://127.0.0.1:5000/dashboard/khach-hang/lich-hen', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!lichHenRes.ok) throw new Error('Lỗi khi lấy danh sách lịch hẹn');
      const lichHenData = await lichHenRes.json();
      setLichHens(Array.isArray(lichHenData) ? lichHenData : []);

      setEditingLichHen(null);
    } catch (err) {
      console.error('Lỗi khi chỉnh sửa lịch hẹn:', err.message);
      alert(err.message);
    }
  };

  const handleHuyLich = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:5000/lich-hen/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi khi hủy lịch hẹn');
      }

      const data = await res.json();
      alert(data.message);

      const lichHenRes = await fetch('http://127.0.0.1:5000/dashboard/khach-hang/lich-hen', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!lichHenRes.ok) throw new Error('Lỗi khi lấy danh sách lịch hẹn');
      const lichHenData = await lichHenRes.json();
      setLichHens(Array.isArray(lichHenData) ? lichHenData : []);
    } catch (err) {
      console.error('Lỗi khi hủy lịch hẹn:', err.message);
      alert(err.message);
    }
  };

  const handleTaiBaoCao = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:5000/lich-hen/${id}/bao-cao`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi khi tải báo cáo');
      }

      const data = await res.json();
      alert('Báo cáo: ' + JSON.stringify(data));
    } catch (err) {
      console.error('Lỗi khi tải báo cáo:', err.message);
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
    if (!timeString) return 'N/A';
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
                    <h5 className="card-title">Tổng số thông báo</h5>
                    <p className="card-text display-4">{thongBaos.length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h5>Chào mừng</h5>
              <p>Chào mừng bạn đến với dashboard khách hàng! Quản lý lịch hẹn và thông báo của bạn một cách dễ dàng.</p>
            </div>
          </div>
        );
      case 'dat_lich':
        return (
          <div className="p-4 tab-content">
            <h4 className="mb-3">Đặt lịch hẹn mới</h4>
            <div className="mb-2">
              <label className="form-label">Chọn ngày hẹn:</label>
              <input
                type="date"
                className="form-control"
                value={newLichHen.ngay_hen}
                onChange={(e) => setNewLichHen({ ...newLichHen, ngay_hen: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Chọn dịch vụ:</label>
              <select
                className="form-select"
                value={newLichHen.dich_vu_id}
                onChange={(e) => setNewLichHen({ ...newLichHen, dich_vu_id: e.target.value })}
              >
                <option value="">Chọn dịch vụ</option>
                {dichVus.map((dv) => (
                  <option key={dv.id} value={dv.id}>
                    {dv.ten_dich_vu}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Chọn gara:</label>
              <select
                className="form-select"
                value={newLichHen.gara_id}
                onChange={(e) => setNewLichHen({ ...newLichHen, gara_id: e.target.value })}
              >
                <option value="">Chọn gara</option>
                {garas.map((gara) => (
                  <option key={gara.id} value={gara.id}>
                    {gara.ten_gara} - {gara.dia_chi}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Chọn khung giờ:</label>
              <select
                className="form-select"
                value={newLichHen.khung_gio_id}
                onChange={(e) => setNewLichHen({ ...newLichHen, khung_gio_id: e.target.value })}
              >
                <option value="">Chọn khung giờ</option>
                {khungGios
                  .filter((kg) => kg.so_nhan_vien_ranh > 0)
                  .map((kg) => (
                    <option key={kg.id} value={kg.id}>
                      {kg.thoi_gian_bat_dau && kg.thoi_gian_ket_thuc
                        ? `${formatTime(kg.thoi_gian_bat_dau)} - ${formatTime(kg.thoi_gian_ket_thuc)}`
                        : 'N/A'}
                    </option>
                  ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleDatLich}>
              Đặt lịch
            </button>
          </div>
        );
      case 'lich_hen':
        return (
          <div className="p-4 tab-content">
            <h4 className="mb-3">Lịch hẹn của tôi</h4>
            {editingLichHen && (
              <div className="mb-4 p-3 border rounded">
                <h5 className="mb-3">Chỉnh sửa lịch hẹn (ID: {editingLichHen.id})</h5>
                <div className="mb-2">
                  <label className="form-label">Chọn ngày hẹn:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editingLichHen.ngay_hen}
                    onChange={(e) => setEditingLichHen({ ...editingLichHen, ngay_hen: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Chọn dịch vụ:</label>
                  <select
                    className="form-select"
                    value={editingLichHen.dich_vu_id}
                    onChange={(e) => setEditingLichHen({ ...editingLichHen, dich_vu_id: e.target.value })}
                  >
                    <option value="">Chọn dịch vụ</option>
                    {dichVus.map((dv) => (
                      <option key={dv.id} value={dv.id}>
                        {dv.ten_dich_vu}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Chọn gara:</label>
                  <select
                    className="form-select"
                    value={editingLichHen.gara_id}
                    onChange={(e) => setEditingLichHen({ ...editingLichHen, gara_id: e.target.value })}
                  >
                    <option value="">Chọn gara</option>
                    {garas.map((gara) => (
                      <option key={gara.id} value={gara.id}>
                        {gara.ten_gara} - {gara.dia_chi}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Chọn khung giờ:</label>
                  <select
                    className="form-select"
                    value={editingLichHen.khung_gio_id}
                    onChange={(e) => setEditingLichHen({ ...editingLichHen, khung_gio_id: e.target.value })}
                  >
                    <option value="">Chọn khung giờ</option>
                    {khungGios
                      .filter((kg) => kg.so_nhan_vien_ranh > 0 || kg.id === parseInt(editingLichHen.khung_gio_id))
                      .map((kg) => (
                        <option key={kg.id} value={kg.id}>
                          {kg.thoi_gian_bat_dau && kg.thoi_gian_ket_thuc
                            ? `${formatTime(kg.thoi_gian_bat_dau)} - ${formatTime(kg.thoi_gian_ket_thuc)}`
                            : 'N/A'}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <button className="btn btn-success me-2" onClick={handleCapNhatLichHen}>
                    Cập nhật
                  </button>
                  <button className="btn btn-secondary" onClick={() => setEditingLichHen(null)}>
                    Hủy chỉnh sửa
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
                <option value="dang_cho">Đang chờ</option>
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
                        <th>Dịch vụ</th>
                        <th>Gara</th>
                        <th>Khung giờ</th>
                        <th>Ngày hẹn</th>
                        <th>Trạng thái</th>
                        <th>Thời gian tạo</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLichHens.map((lh) => {
                        const khungGio = khungGios.find((kg) => kg.id === lh.khung_gio_id);
                        return (
                          <tr key={lh.id}>
                            <td>{lh.id}</td>
                            <td>{dichVus.find((dv) => dv.id === lh.dich_vu_id)?.ten_dich_vu || 'N/A'}</td>
                            <td>{lh.ten_gara ? `${lh.ten_gara} (${lh.dia_chi_gara})` : 'N/A'}</td>
                            <td>
                              {khungGio && khungGio.thoi_gian_bat_dau && khungGio.thoi_gian_ket_thuc
                                ? `${formatTime(khungGio.thoi_gian_bat_dau)} - ${formatTime(khungGio.thoi_gian_ket_thuc)}`
                                : 'Không xác định'}
                            </td>
                            <td>{lh.ngay_hen ? formatDate(lh.ngay_hen) : 'N/A'}</td>
                            <td>{formatTrangThai(lh.trang_thai)}</td>
                            <td>{lh.thoi_gian_tao ? new Date(lh.thoi_gian_tao).toLocaleString() : 'N/A'}</td>
                            <td>
                              {lh.trang_thai === 'dang_cho' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-primary me-1"
                                    onClick={() => handleChinhSua(lh)}
                                  >
                                    Chỉnh sửa
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleHuyLich(lh.id)}
                                  >
                                    Hủy
                                  </button>
                                </>
                              )}
                              {lh.trang_thai === 'da_xac_nhan' && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleHuyLich(lh.id)}
                                >
                                  Hủy
                                </button>
                              )}
                              {lh.trang_thai === 'da_hoan_thanh' && (
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleTaiBaoCao(lh.id)}
                                >
                                  Tải báo cáo
                                </button>
                              )}
                              {lh.trang_thai === 'da_huy' && <span>Đã hủy</span>}
                            </td>
                          </tr>
                        );
                      })}
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
                  <strong>Vai trò:</strong> {userInfo.vai_tro === 'khach_hang' ? 'Khách hàng' : 'N/A'}
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
        <h5 className="offcanvas-title">Đặt lịch bảo dưỡng</h5>
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
              className={`nav-link ${activeTab === 'dat_lich' ? 'active' : ''}`}
              onClick={() => setActiveTab('dat_lich')}
            >
              Đặt lịch hẹn
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'lich_hen' ? 'active' : ''}`}
              onClick={() => setActiveTab('lich_hen')}
            >
              Lịch hẹn của tôi
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
          <h3>Dashboard Khách Hàng</h3>
        </div>
        {renderMainContent()}
      </div>
    </div>
  );
}

export default DashboardKhachHang;