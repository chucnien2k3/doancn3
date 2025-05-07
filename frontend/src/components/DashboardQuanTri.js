import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

const DashboardQuanTri = () => {
    const [lichHens, setLichHens] = useState([]);
    const [phanCongs, setPhanCongs] = useState([]);
    const [baoCao, setBaoCao] = useState({});
    const [nhanVienRanh, setNhanVienRanh] = useState({});
    const [nguoiDungs, setNguoiDungs] = useState([]);
    const [garas, setGaras] = useState([]);
    const [dichVus, setDichVus] = useState([]);
    const [khungGios, setKhungGios] = useState([]);
    const [newGara, setNewGara] = useState({ ten_gara: '', dia_chi: '', so_dien_thoai: '', trang_thai: 'hoat_dong' });
    const [newDichVu, setNewDichVu] = useState({ ten_dich_vu: '', mo_ta: '', thoi_gian_du_kien: '' });
    const [newKhungGio, setNewKhungGio] = useState({ thoi_gian_bat_dau: '', thoi_gian_ket_thuc: '', so_nhan_vien_ranh: 0 });
    const [editingGara, setEditingGara] = useState(null);
    const [editingDichVu, setEditingDichVu] = useState(null);
    const [editingKhungGio, setEditingKhungGio] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [userInfo, setUserInfo] = useState({ email: '', ho_va_ten: '', vai_tro: '' });
    const [error, setError] = useState(null);
    const [validationError, setValidationError] = useState('');
    const [currentSection, setCurrentSection] = useState('tong-quan');
    const [selectedNhanVien, setSelectedNhanVien] = useState({});

    const [trangThaiFilter, setTrangThaiFilter] = useState('');
    const [emailSearch, setEmailSearch] = useState('');
    const [tenGaraSearch, setTenGaraSearch] = useState('');
    const [tenDichVuSearch, setTenDichVuSearch] = useState('');
    const [vaiTroFilter, setVaiTroFilter] = useState('');
    const [currentPageLichHen, setCurrentPageLichHen] = useState(1);
    const [currentPagePhanCong, setCurrentPagePhanCong] = useState(1);
    const [currentPageTaiKhoan, setCurrentPageTaiKhoan] = useState(1);
    const [currentPageGara, setCurrentPageGara] = useState(1);
    const [currentPageDichVu, setCurrentPageDichVu] = useState(1);
    const [currentPageKhungGio, setCurrentPageKhungGio] = useState(1);
    const itemsPerPage = 5;

    const navigate = useNavigate();

    const handleError = useCallback((err) => {
        if (err.response && err.response.status === 403) {
            setError('Bạn không có quyền truy cập trang này');
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
            console.error(err);
        }
    }, [navigate]);

    const fetchUserInfo = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Vui lòng đăng nhập để tiếp tục');
                navigate('/login');
                return;
            }

            const response = await axios.get('http://127.0.0.1:5000/dashboard/quan-tri/thong-tin', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserInfo(response.data);
        } catch (err) {
            handleError(err);
        }
    }, [navigate, handleError]);

    const fetchLichHens = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:5000/dashboard/quan-tri/lich-hen', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLichHens(response.data);
        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    const fetchPhanCongs = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:5000/dashboard/quan-tri/phan-cong', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPhanCongs(response.data);
            const newSelectedNhanVien = {};
            response.data.forEach((pc) => {
                newSelectedNhanVien[pc.lich_hen_id] = pc.nhan_vien;
            });
            setSelectedNhanVien(newSelectedNhanVien);
        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    const fetchBaoCao = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:5000/dashboard/quan-tri/bao-cao', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBaoCao(response.data);
        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    const fetchNhanVienRanh = useCallback(async (lichHenId) => {
        try {
            const token = localStorage.getItem('token');
            const lichHen = lichHens.find((lh) => lh.id === lichHenId);
            if (!lichHen) return;

            const response = await axios.get('http://127.0.0.1:5000/dashboard/quan-tri/nhan-vien-ranh', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    ngay_hen: lichHen.ngay_hen,
                    khung_gio_id: lichHen.khung_gio.id || 1,
                },
            });
            setNhanVienRanh((prev) => ({
                ...prev,
                [lichHenId]: response.data,
            }));
        } catch (err) {
            handleError(err);
        }
    }, [lichHens, handleError]);

    const fetchNguoiDungs = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:5000/dashboard/quan-tri/nguoi-dung', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNguoiDungs(response.data);
        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    const fetchGaras = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:5000/dashboard/quan-tri/gara', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGaras(response.data);
        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    const fetchDichVus = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:5000/dashboard/quan-tri/dich-vu', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDichVus(response.data);
        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    const fetchKhungGios = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:5000/dashboard/quan-tri/khung-gio', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setKhungGios(response.data);
        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    const validateGara = useCallback(() => {
        if (!newGara.ten_gara.trim()) {
            return 'Tên gara không được để trống.';
        }
        if (!newGara.dia_chi.trim()) {
            return 'Địa chỉ không được để trống.';
        }
        return '';
    }, [newGara]);

    const validateDichVu = useCallback(() => {
        if (!newDichVu.ten_dich_vu.trim()) {
            return 'Tên dịch vụ không được để trống.';
        }
        if (!newDichVu.thoi_gian_du_kien) {
            return 'Thời gian dự kiến không được để trống.';
        }
        return '';
    }, [newDichVu]);

    const validateKhungGio = useCallback(() => {
        if (!newKhungGio.thoi_gian_bat_dau) {
            return 'Thời gian bắt đầu không được để trống.';
        }
        if (!newKhungGio.thoi_gian_ket_thuc) {
            return 'Thời gian kết thúc không được để trống.';
        }
        return '';
    }, [newKhungGio]);

    const addGara = useCallback(async () => {
        const error = validateGara();
        if (error) {
            setValidationError(error);
            return;
        }
        setValidationError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:5000/dashboard/quan-tri/gara', newGara, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchGaras();
            setNewGara({ ten_gara: '', dia_chi: '', so_dien_thoai: '', trang_thai: 'hoat_dong' });
        } catch (err) {
            handleError(err);
        }
    }, [fetchGaras, newGara, handleError, validateGara]);

    const addDichVu = useCallback(async () => {
        const error = validateDichVu();
        if (error) {
            setValidationError(error);
            return;
        }
        setValidationError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:5000/dashboard/quan-tri/dich-vu', newDichVu, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDichVus();
            setNewDichVu({ ten_dich_vu: '', mo_ta: '', thoi_gian_du_kien: '' });
        } catch (err) {
            handleError(err);
        }
    }, [fetchDichVus, newDichVu, handleError, validateDichVu]);

    const addKhungGio = useCallback(async () => {
        const error = validateKhungGio();
        if (error) {
            setValidationError(error);
            return;
        }
        setValidationError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:5000/dashboard/quan-tri/khung-gio', newKhungGio, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchKhungGios();
            setNewKhungGio({ thoi_gian_bat_dau: '', thoi_gian_ket_thuc: '', so_nhan_vien_ranh: 0 });
        } catch (err) {
            handleError(err);
        }
    }, [fetchKhungGios, newKhungGio, handleError, validateKhungGio]);

    const updateGara = useCallback(async (garaId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://127.0.0.1:5000/dashboard/quan-tri/gara/${garaId}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchGaras();
            setEditingGara(null);
        } catch (err) {
            handleError(err);
        }
    }, [fetchGaras, handleError]);

    const updateDichVu = useCallback(async (dichVuId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://127.0.0.1:5000/dashboard/quan-tri/dich-vu/${dichVuId}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDichVus();
            setEditingDichVu(null);
        } catch (err) {
            handleError(err);
        }
    }, [fetchDichVus, handleError]);

    const updateKhungGio = useCallback(async (khungGioId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://127.0.0.1:5000/dashboard/quan-tri/khung-gio/${khungGioId}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchKhungGios();
            setEditingKhungGio(null);
        } catch (err) {
            handleError(err);
        }
    }, [fetchKhungGios, handleError]);

    const deleteGara = useCallback(async (garaId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa gara này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:5000/dashboard/quan-tri/gara/${garaId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchGaras();
        } catch (err) {
            handleError(err);
        }
    }, [fetchGaras, handleError]);

    const deleteDichVu = useCallback(async (dichVuId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:5000/dashboard/quan-tri/dich-vu/${dichVuId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDichVus();
        } catch (err) {
            handleError(err);
        }
    }, [fetchDichVus, handleError]);

    const deleteKhungGio = useCallback(async (khungGioId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:5000/dashboard/quan-tri/khung-gio/${khungGioId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchKhungGios();
        } catch (err) {
            handleError(err);
        }
    }, [fetchKhungGios, handleError]);

    const updateTrangThai = useCallback(async (id, trangThai) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://127.0.0.1:5000/dashboard/quan-tri/lich-hen/${id}`,
                { trang_thai: trangThai },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchLichHens();
            fetchPhanCongs();
        } catch (err) {
            handleError(err);
        }
    }, [fetchLichHens, fetchPhanCongs, handleError]);

    const phanCongNhanVien = useCallback(async (lichHenId, nhanVienId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://127.0.0.1:5000/dashboard/quan-tri/phan-cong/${lichHenId}`,
                { nhan_vien_id: nhanVienId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPhanCongs();
            fetchNhanVienRanh(lichHenId);
        } catch (err) {
            handleError(err);
        }
    }, [fetchNhanVienRanh, fetchPhanCongs, handleError]);

    const huyPhanCong = useCallback(async (lichHenId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:5000/dashboard/quan-tri/phan-cong/${lichHenId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPhanCongs();
            fetchNhanVienRanh(lichHenId);
        } catch (err) {
            handleError(err);
        }
    }, [fetchPhanCongs, fetchNhanVienRanh, handleError]);

    const updateNguoiDung = useCallback(async (userId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://127.0.0.1:5000/dashboard/quan-tri/nguoi-dung/${userId}`,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchNguoiDungs();
            setEditingUser(null);
        } catch (err) {
            handleError(err);
        }
    }, [fetchNguoiDungs, handleError]);

    const deleteNguoiDung = useCallback(async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:5000/dashboard/quan-tri/nguoi-dung/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchNguoiDungs();
        } catch (err) {
            handleError(err);
        }
    }, [fetchNguoiDungs, handleError]);

    const formatTrangThai = (trangThai) => {
        switch (trangThai) {
            case 'dang_cho':
                return 'Đang chờ';
            case 'da_xac_nhan':
                return 'Đã xác nhận';
            case 'da_hoan_thanh':
                return 'Đã hoàn thành';
            case 'da_huy':
                return 'Đã hủy';
            case 'hoat_dong':
                return 'Hoạt động';
            case 'tam_ngung':
                return 'Tạm ngừng';
            default:
                return trangThai;
        }
    };

    const formatVaiTro = (vaiTro) => {
        switch (vaiTro) {
            case 'nhan_vien':
                return 'Nhân viên';
            case 'khach_hang':
                return 'Khách hàng';
            case 'quan_tri':
                return 'Quản trị';
            default:
                return vaiTro;
        }
    };

    useEffect(() => {
        fetchUserInfo();
        fetchLichHens();
        fetchPhanCongs();
        fetchBaoCao();
        fetchNguoiDungs();
        fetchGaras();
        fetchDichVus();
        fetchKhungGios();
    }, [fetchUserInfo, fetchLichHens, fetchPhanCongs, fetchBaoCao, fetchNguoiDungs, fetchGaras, fetchDichVus, fetchKhungGios]);

    const filteredLichHens = trangThaiFilter
        ? lichHens.filter((lh) => lh.trang_thai === trangThaiFilter)
        : lichHens;
    const indexOfLastLichHen = currentPageLichHen * itemsPerPage;
    const indexOfFirstLichHen = indexOfLastLichHen - itemsPerPage;
    const currentLichHens = filteredLichHens.slice(indexOfFirstLichHen, indexOfLastLichHen);
    const totalPagesLichHen = Math.ceil(filteredLichHens.length / itemsPerPage);

    const filteredLichHensPhanCong = emailSearch
        ? lichHens.filter((lh) =>
              lh.khach_hang.email.toLowerCase().includes(emailSearch.toLowerCase())
          )
        : lichHens;
    const indexOfLastPhanCong = currentPagePhanCong * itemsPerPage;
    const indexOfFirstPhanCong = indexOfLastPhanCong - itemsPerPage;
    const currentLichHensPhanCong = filteredLichHensPhanCong.slice(indexOfFirstPhanCong, indexOfLastPhanCong);
    const totalPagesPhanCong = Math.ceil(filteredLichHensPhanCong.length / itemsPerPage);

    const filteredNguoiDungs = vaiTroFilter
        ? nguoiDungs.filter((nd) => nd.vai_tro === vaiTroFilter)
        : nguoiDungs;
    const indexOfLastTaiKhoan = currentPageTaiKhoan * itemsPerPage;
    const indexOfFirstTaiKhoan = indexOfLastTaiKhoan - itemsPerPage;
    const currentNguoiDungs = filteredNguoiDungs.slice(indexOfFirstTaiKhoan, indexOfLastTaiKhoan);
    const totalPagesTaiKhoan = Math.ceil(filteredNguoiDungs.length / itemsPerPage);

    const filteredGaras = tenGaraSearch
        ? garas.filter((gara) =>
              gara.ten_gara.toLowerCase().includes(tenGaraSearch.toLowerCase())
          )
        : garas;
    const indexOfLastGara = currentPageGara * itemsPerPage;
    const indexOfFirstGara = indexOfLastGara - itemsPerPage;
    const currentGaras = filteredGaras.slice(indexOfFirstGara, indexOfLastGara);
    const totalPagesGara = Math.ceil(filteredGaras.length / itemsPerPage);

    const filteredDichVus = tenDichVuSearch
        ? dichVus.filter((dichVu) =>
              dichVu.ten_dich_vu.toLowerCase().includes(tenDichVuSearch.toLowerCase())
          )
        : dichVus;
    const indexOfLastDichVu = currentPageDichVu * itemsPerPage;
    const indexOfFirstDichVu = indexOfLastDichVu - itemsPerPage;
    const currentDichVus = filteredDichVus.slice(indexOfFirstDichVu, indexOfLastDichVu);
    const totalPagesDichVu = Math.ceil(filteredDichVus.length / itemsPerPage);

    const indexOfLastKhungGio = currentPageKhungGio * itemsPerPage;
    const indexOfFirstKhungGio = indexOfLastKhungGio - itemsPerPage;
    const currentKhungGios = khungGios.slice(indexOfFirstKhungGio, indexOfLastKhungGio);
    const totalPagesKhungGio = Math.ceil(khungGios.length / itemsPerPage);

    const paginateLichHen = (pageNumber) => setCurrentPageLichHen(pageNumber);
    const paginatePhanCong = (pageNumber) => setCurrentPagePhanCong(pageNumber);
    const paginateTaiKhoan = (pageNumber) => setCurrentPageTaiKhoan(pageNumber);
    const paginateGara = (pageNumber) => setCurrentPageGara(pageNumber);
    const paginateDichVu = (pageNumber) => setCurrentPageDichVu(pageNumber);
    const paginateKhungGio = (pageNumber) => setCurrentPageKhungGio(pageNumber);

    const renderTongQuan = () => (
        <div className="tab-content">
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title">Tổng số lịch hẹn</h3>
                            <p className="card-text">{lichHens.length}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title">Tổng số dịch vụ</h3>
                            <p className="card-text">{baoCao.dich_vu_stats?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="welcome-message">
                Chào mừng bạn đến với dashboard Quản trị viên! Quản lý hệ thống một cách dễ dàng và hiệu quả.
            </div>
        </div>
    );

    const renderQuanLyLichHen = () => (
        <div>
            <h2>Quản lý lịch hẹn</h2>
            <div className="mb-2">
                <label className="form-label">Lọc theo trạng thái:</label>
                <select
                    className="form-select"
                    value={trangThaiFilter}
                    onChange={(e) => {
                        setTrangThaiFilter(e.target.value);
                        setCurrentPageLichHen(1);
                    }}
                >
                    <option value="">Tất cả</option>
                    <option value="dang_cho">Đang chờ</option>
                    <option value="da_xac_nhan">Đã xác nhận</option>
                    <option value="da_hoan_thanh">Đã hoàn thành</option>
                    <option value="da_huy">Đã hủy</option>
                </select>
            </div>
            {filteredLichHens.length > 0 ? (
                <div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
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
                                {currentLichHens.map((lichHen) => (
                                    <tr key={lichHen.id}>
                                        <td>{lichHen.id}</td>
                                        <td>{lichHen.khach_hang.email}</td>
                                        <td>{lichHen.dich_vu.ten_dich_vu}</td>
                                        <td>{`${lichHen.khung_gio.thoi_gian_bat_dau} - ${lichHen.khung_gio.thoi_gian_ket_thuc}`}</td>
                                        <td>{lichHen.ngay_hen}</td>
                                        <td>{formatTrangThai(lichHen.trang_thai)}</td>
                                        <td>
                                            {lichHen.trang_thai === 'da_huy' ? (
                                                'Đã hủy'
                                            ) : lichHen.trang_thai === 'da_hoan_thanh' ? (
                                                'Đã hoàn thành'
                                            ) : (
                                                <select
                                                    value={lichHen.trang_thai}
                                                    onChange={(e) => updateTrangThai(lichHen.id, e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="dang_cho">Đang chờ</option>
                                                    <option value="da_xac_nhan">Đã xác nhận</option>
                                                    <option value="da_hoan_thanh">Đã hoàn thành</option>
                                                    <option value="da_huy">Đã hủy</option>
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <nav>
                        <ul className="pagination justify-content-center">
                            {Array.from({ length: totalPagesLichHen }, (_, index) => (
                                <li
                                    key={index + 1}
                                    className={`page-item ${currentPageLichHen === index + 1 ? 'active' : ''}`}
                                >
                                    <button className="page-link" onClick={() => paginateLichHen(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            ) : (
                <p>Không có lịch hẹn nào.</p>
            )}
        </div>
    );

    const renderPhanCongNhanVien = () => (
        <div>
            <h2>Phân công nhân viên</h2>
            <div className="mb-2">
                <label className="form-label">Tìm kiếm theo email khách hàng:</label>
                <input
                    type="text"
                    className="form-control"
                    value={emailSearch}
                    onChange={(e) => {
                        setEmailSearch(e.target.value);
                        setCurrentPagePhanCong(1);
                    }}
                    placeholder="Nhập email khách hàng..."
                />
            </div>
            {filteredLichHensPhanCong.length > 0 ? (
                <div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Lịch hẹn ID</th>
                                    <th>Khách hàng</th>
                                    <th>Ngày hẹn</th>
                                    <th>Khung giờ</th>
                                    <th>Nhân viên</th>
                                    <th>Phân công</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLichHensPhanCong.map((lichHen) => {
                                    const phanCong = phanCongs.find((pc) => pc.lich_hen_id === lichHen.id);
                                    const isCancelled = lichHen.trang_thai === 'da_huy';
                                    const isCompleted = lichHen.trang_thai === 'da_hoan_thanh';
                                    const hasSelectedNhanVien = selectedNhanVien[lichHen.id];

                                    return (
                                        <tr key={lichHen.id}>
                                            <td>{lichHen.id}</td>
                                            <td>{lichHen.khach_hang.email}</td>
                                            <td>{lichHen.ngay_hen}</td>
                                            <td>{`${lichHen.khung_gio.thoi_gian_bat_dau} - ${lichHen.khung_gio.thoi_gian_ket_thuc}`}</td>
                                            <td>
                                                {isCancelled ? (
                                                    'Đã hủy'
                                                ) : isCompleted ? (
                                                    'Đã hoàn thành'
                                                ) : hasSelectedNhanVien ? (
                                                    `Đã phân công (${hasSelectedNhanVien.ho_va_ten})`
                                                ) : phanCong ? (
                                                    `Đã phân công (${phanCong.nhan_vien.ho_va_ten})`
                                                ) : (
                                                    'Chưa phân công'
                                                )}
                                            </td>
                                            <td>
                                                {isCancelled ? (
                                                    'Đã hủy'
                                                ) : isCompleted ? (
                                                    'Đã hoàn thành'
                                                ) : hasSelectedNhanVien || phanCong ? (
                                                    <button
                                                        className="btn btn-warning btn-sm"
                                                        onClick={() => huyPhanCong(lichHen.id)}
                                                        disabled={isCancelled || isCompleted}
                                                    >
                                                        Hủy phân công
                                                    </button>
                                                ) : (
                                                    <select
                                                        value={phanCong ? phanCong.nhan_vien.id : ''}
                                                        onFocus={() => fetchNhanVienRanh(lichHen.id)}
                                                        onChange={(e) => phanCongNhanVien(lichHen.id, e.target.value)}
                                                        className="form-select"
                                                        disabled={isCancelled || isCompleted}
                                                    >
                                                        <option value="">Chọn nhân viên</option>
                                                        {(nhanVienRanh[lichHen.id] || []).map((nv) => (
                                                            <option key={nv.id} value={nv.id}>
                                                                {nv.ho_va_ten}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <nav>
                        <ul className="pagination justify-content-center">
                            {Array.from({ length: totalPagesPhanCong }, (_, index) => (
                                <li
                                    key={index + 1}
                                    className={`page-item ${currentPagePhanCong === index + 1 ? 'active' : ''}`}
                                >
                                    <button className="page-link" onClick={() => paginatePhanCong(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            ) : (
                <p>Không có lịch hẹn nào để phân công.</p>
            )}
        </div>
    );

    const renderBaoCaoThongKe = () => (
        <div>
            <h2>Báo cáo và thống kê</h2>
            <h3>Thống kê lịch hẹn</h3>
            {baoCao.lich_hen_stats && baoCao.lich_hen_stats.length > 0 ? (
                <ul>
                    {baoCao.lich_hen_stats.map((stat, index) => (
                        <li key={index}>
                            Trạng thái: {formatTrangThai(stat.trang_thai)} - Số lượng: {stat.so_luong}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Không có dữ liệu thống kê lịch hẹn.</p>
            )}

            <h3>Thống kê dịch vụ</h3>
            {baoCao.dich_vu_stats && baoCao.dich_vu_stats.length > 0 ? (
                <ul>
                    {baoCao.dich_vu_stats.map((stat, index) => (
                        <li key={index}>
                            Dịch vụ: {stat.ten_dich_vu} - Số lượng: {stat.so_luong}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Không có dữ liệu thống kê dịch vụ.</p>
            )}
        </div>
    );

    const renderQuanLyTaiKhoan = () => (
        <div>
            <h2>Quản lý tài khoản người dùng</h2>
            <div className="mb-2">
                <label className="form-label">Lọc theo vai trò:</label>
                <select
                    className="form-select"
                    value={vaiTroFilter}
                    onChange={(e) => {
                        setVaiTroFilter(e.target.value);
                        setCurrentPageTaiKhoan(1);
                    }}
                >
                    <option value="">Tất cả</option>
                    <option value="khach_hang">Khách hàng</option>
                    <option value="nhan_vien">Nhân viên</option>
                    <option value="quan_tri">Quản trị</option>
                </select>
            </div>
            {filteredNguoiDungs.length > 0 ? (
                <div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Số điện thoại</th>
                                    <th>Vai trò</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentNguoiDungs.map((nguoiDung) => (
                                    <tr key={nguoiDung.id}>
                                        <td>{nguoiDung.id}</td>
                                        {editingUser && editingUser.id === nguoiDung.id ? (
                                            <>
                                                <td>
                                                    <input
                                                        type="email"
                                                        value={editingUser.email}
                                                        onChange={(e) =>
                                                            setEditingUser({ ...editingUser, email: e.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={editingUser.so_dien_thoai}
                                                        onChange={(e) =>
                                                            setEditingUser({ ...editingUser, so_dien_thoai: e.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        value={editingUser.vai_tro}
                                                        onChange={(e) =>
                                                            setEditingUser({ ...editingUser, vai_tro: e.target.value })
                                                        }
                                                        className="form-select"
                                                    >
                                                        <option value="khach_hang">Khách hàng</option>
                                                        <option value="nhan_vien">Nhân viên</option>
                                                        <option value="quan_tri">Quản trị</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-success btn-sm me-2"
                                                        onClick={() =>
                                                            updateNguoiDung(nguoiDung.id, {
                                                                email: editingUser.email,
                                                                so_dien_thoai: editingUser.so_dien_thoai,
                                                                vai_tro: editingUser.vai_tro,
                                                            })
                                                        }
                                                    >
                                                        Lưu
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setEditingUser(null)}
                                                    >
                                                        Hủy
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{nguoiDung.email}</td>
                                                <td>{nguoiDung.so_dien_thoai}</td>
                                                <td>{formatVaiTro(nguoiDung.vai_tro)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary btn-sm me-2"
                                                        onClick={() => setEditingUser(nguoiDung)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => deleteNguoiDung(nguoiDung.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <nav>
                        <ul className="pagination justify-content-center">
                            {Array.from({ length: totalPagesTaiKhoan }, (_, index) => (
                                <li
                                    key={index + 1}
                                    className={`page-item ${currentPageTaiKhoan === index + 1 ? 'active' : ''}`}
                                >
                                    <button className="page-link" onClick={() => paginateTaiKhoan(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            ) : (
                <p>Không có tài khoản người dùng nào.</p>
            )}
        </div>
    );

    const renderQuanLyGara = () => (
        <div>
            <h2>Quản lý gara</h2>
            <div className="mb-4">
                <h3>{editingGara ? 'Chỉnh sửa gara' : 'Thêm gara mới'}</h3>
                {validationError && currentSection === 'quan-ly-gara' && (
                    <p style={{ color: 'red' }}>{validationError}</p>
                )}
                <div className="mb-2">
                    <label className="form-label">Tên gara:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={editingGara ? editingGara.ten_gara : newGara.ten_gara}
                        onChange={(e) => {
                            if (editingGara) {
                                setEditingGara({ ...editingGara, ten_gara: e.target.value });
                            } else {
                                setNewGara({ ...newGara, ten_gara: e.target.value });
                            }
                        }}
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label">Địa chỉ:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={editingGara ? editingGara.dia_chi : newGara.dia_chi}
                        onChange={(e) => {
                            if (editingGara) {
                                setEditingGara({ ...editingGara, dia_chi: e.target.value });
                            } else {
                                setNewGara({ ...newGara, dia_chi: e.target.value });
                            }
                        }}
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label">Số điện thoại:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={editingGara ? editingGara.so_dien_thoai : newGara.so_dien_thoai}
                        onChange={(e) => {
                            if (editingGara) {
                                setEditingGara({ ...editingGara, so_dien_thoai: e.target.value });
                            } else {
                                setNewGara({ ...newGara, so_dien_thoai: e.target.value });
                            }
                        }}
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label">Trạng thái:</label>
                    <select
                        className="form-select"
                        value={editingGara ? editingGara.trang_thai : newGara.trang_thai}
                        onChange={(e) => {
                            if (editingGara) {
                                setEditingGara({ ...editingGara, trang_thai: e.target.value });
                            } else {
                                setNewGara({ ...newGara, trang_thai: e.target.value });
                            }
                        }}
                    >
                        <option value="hoat_dong">Hoạt động</option>
                        <option value="tam_ngung">Tạm ngừng</option>
                    </select>
                </div>
                <div>
                    {editingGara ? (
                        <>
                            <button
                                className="btn btn-success me-2"
                                onClick={() =>
                                    updateGara(editingGara.id, {
                                        ten_gara: editingGara.ten_gara,
                                        dia_chi: editingGara.dia_chi,
                                        so_dien_thoai: editingGara.so_dien_thoai,
                                        trang_thai: editingGara.trang_thai,
                                    })
                                }
                            >
                                Lưu
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEditingGara(null)}
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={addGara}>
                            Thêm gara
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-2">
                <label className="form-label">Tìm kiếm theo tên gara:</label>
                <input
                    type="text"
                    className="form-control"
                    value={tenGaraSearch}
                    onChange={(e) => {
                        setTenGaraSearch(e.target.value);
                        setCurrentPageGara(1);
                    }}
                    placeholder="Nhập tên gara..."
                />
            </div>

            {filteredGaras.length > 0 ? (
                <div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên gara</th>
                                    <th>Địa chỉ</th>
                                    <th>Số điện thoại</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentGaras.map((gara) => (
                                    <tr key={gara.id}>
                                        <td>{gara.id}</td>
                                        <td>{gara.ten_gara}</td>
                                        <td>{gara.dia_chi}</td>
                                        <td>{gara.so_dien_thoai || 'N/A'}</td>
                                        <td>{formatTrangThai(gara.trang_thai)}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm me-2"
                                                onClick={() => setEditingGara(gara)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteGara(gara.id)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <nav>
                        <ul className="pagination justify-content-center">
                            {Array.from({ length: totalPagesGara }, (_, index) => (
                                <li
                                    key={index + 1}
                                    className={`page-item ${currentPageGara === index + 1 ? 'active' : ''}`}
                                >
                                    <button className="page-link" onClick={() => paginateGara(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            ) : (
                <p>Không có gara nào.</p>
            )}
        </div>
    );

    const renderQuanLyDichVu = () => (
        <div>
            <h2>Quản lý dịch vụ</h2>
            <div className="mb-4">
                <h3>{editingDichVu ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                {validationError && currentSection === 'quan-ly-dich-vu' && (
                    <p style={{ color: 'red' }}>{validationError}</p>
                )}
                <div className="mb-2">
                    <label className="form-label">Tên dịch vụ:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={editingDichVu ? editingDichVu.ten_dich_vu : newDichVu.ten_dich_vu}
                        onChange={(e) => {
                            if (editingDichVu) {
                                setEditingDichVu({ ...editingDichVu, ten_dich_vu: e.target.value });
                            } else {
                                setNewDichVu({ ...newDichVu, ten_dich_vu: e.target.value });
                            }
                        }}
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label">Thời gian dự kiến (phút):</label>
                    <input
                        type="number"
                        className="form-control"
                        value={editingDichVu ? editingDichVu.thoi_gian_du_kien : newDichVu.thoi_gian_du_kien}
                        onChange={(e) => {
                            if (editingDichVu) {
                                setEditingDichVu({ ...editingDichVu, thoi_gian_du_kien: e.target.value });
                            } else {
                                setNewDichVu({ ...newDichVu, thoi_gian_du_kien: e.target.value });
                            }
                        }}
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label">Mô tả:</label>
                    <textarea
                        className="form-control"
                        value={editingDichVu ? editingDichVu.mo_ta : newDichVu.mo_ta}
                        onChange={(e) => {
                            if (editingDichVu) {
                                setEditingDichVu({ ...editingDichVu, mo_ta: e.target.value });
                            } else {
                                setNewDichVu({ ...newDichVu, mo_ta: e.target.value });
                            }
                        }}
                    />
                </div>
                <div>
                    {editingDichVu ? (
                        <>
                            <button
                                className="btn btn-success me-2"
                                onClick={() =>
                                    updateDichVu(editingDichVu.id, {
                                        ten_dich_vu: editingDichVu.ten_dich_vu,
                                        mo_ta: editingDichVu.mo_ta,
                                        thoi_gian_du_kien: editingDichVu.thoi_gian_du_kien,
                                    })
                                }
                            >
                                Lưu
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEditingDichVu(null)}
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={addDichVu}>
                            Thêm dịch vụ
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-2">
                <label className="form-label">Tìm kiếm theo tên dịch vụ:</label>
                <input
                    type="text"
                    className="form-control"
                    value={tenDichVuSearch}
                    onChange={(e) => {
                        setTenDichVuSearch(e.target.value);
                        setCurrentPageDichVu(1);
                    }}
                    placeholder="Nhập tên dịch vụ..."
                />
            </div>

            {filteredDichVus.length > 0 ? (
                <div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên dịch vụ</th>
                                    <th>Thời gian dự kiến (phút)</th>
                                    <th>Mô tả</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentDichVus.map((dichVu) => (
                                    <tr key={dichVu.id}>
                                        <td>{dichVu.id}</td>
                                        <td>{dichVu.ten_dich_vu}</td>
                                        <td>{dichVu.thoi_gian_du_kien}</td>
                                        <td>{dichVu.mo_ta || 'N/A'}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm me-2"
                                                onClick={() => setEditingDichVu(dichVu)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteDichVu(dichVu.id)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <nav>
                        <ul className="pagination justify-content-center">
                            {Array.from({ length: totalPagesDichVu }, (_, index) => (
                                <li
                                    key={index + 1}
                                    className={`page-item ${currentPageDichVu === index + 1 ? 'active' : ''}`}
                                >
                                    <button className="page-link" onClick={() => paginateDichVu(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            ) : (
                <p>Không có dịch vụ nào.</p>
            )}
        </div>
    );

    const renderQuanLyKhungGio = () => (
        <div>
            <h2>Quản lý khung giờ</h2>
            <div className="mb-4">
                <h3>{editingKhungGio ? 'Chỉnh sửa khung giờ' : 'Thêm khung giờ mới'}</h3>
                {validationError && currentSection === 'quan-ly-khung-gio' && (
                    <p style={{ color: 'red' }}>{validationError}</p>
                )}
                <div className="mb-2">
                    <label className="form-label">Thời gian bắt đầu:</label>
                    <input
                        type="time"
                        className="form-control"
                        value={editingKhungGio ? editingKhungGio.thoi_gian_bat_dau : newKhungGio.thoi_gian_bat_dau}
                        onChange={(e) => {
                            if (editingKhungGio) {
                                setEditingKhungGio({ ...editingKhungGio, thoi_gian_bat_dau: e.target.value });
                            } else {
                                setNewKhungGio({ ...newKhungGio, thoi_gian_bat_dau: e.target.value });
                            }
                        }}
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label">Thời gian kết thúc:</label>
                    <input
                        type="time"
                        className="form-control"
                        value={editingKhungGio ? editingKhungGio.thoi_gian_ket_thuc : newKhungGio.thoi_gian_ket_thuc}
                        onChange={(e) => {
                            if (editingKhungGio) {
                                setEditingKhungGio({ ...editingKhungGio, thoi_gian_ket_thuc: e.target.value });
                            } else {
                                setNewKhungGio({ ...newKhungGio, thoi_gian_ket_thuc: e.target.value });
                            }
                        }}
                    />
                </div>
                <div className="mb-2">
                    <label className="form-label">Số nhân viên rảnh:</label>
                    <input
                        type="number"
                        className="form-control"
                        value={editingKhungGio ? editingKhungGio.so_nhan_vien_ranh : newKhungGio.so_nhan_vien_ranh}
                        onChange={(e) => {
                            if (editingKhungGio) {
                                setEditingKhungGio({ ...editingKhungGio, so_nhan_vien_ranh: parseInt(e.target.value) });
                            } else {
                                setNewKhungGio({ ...newKhungGio, so_nhan_vien_ranh: parseInt(e.target.value) });
                            }
                        }}
                        min="0"
                    />
                </div>
                <div>
                    {editingKhungGio ? (
                        <>
                            <button
                                className="btn btn-success me-2"
                                onClick={() =>
                                    updateKhungGio(editingKhungGio.id, {
                                        thoi_gian_bat_dau: editingKhungGio.thoi_gian_bat_dau,
                                        thoi_gian_ket_thuc: editingKhungGio.thoi_gian_ket_thuc,
                                        so_nhan_vien_ranh: editingKhungGio.so_nhan_vien_ranh,
                                    })
                                }
                            >
                                Lưu
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEditingKhungGio(null)}
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={addKhungGio}>
                            Thêm khung giờ
                        </button>
                    )}
                </div>
            </div>

            {khungGios.length > 0 ? (
                <div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Thời gian bắt đầu</th>
                                    <th>Thời gian kết thúc</th>
                                    <th>Số nhân viên rảnh</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentKhungGios.map((khungGio) => (
                                    <tr key={khungGio.id}>
                                        <td>{khungGio.id}</td>
                                        <td>{khungGio.thoi_gian_bat_dau}</td>
                                        <td>{khungGio.thoi_gian_ket_thuc}</td>
                                        <td>{khungGio.so_nhan_vien_ranh}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm me-2"
                                                onClick={() => setEditingKhungGio(khungGio)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteKhungGio(khungGio.id)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <nav>
                        <ul className="pagination justify-content-center">
                            {Array.from({ length: totalPagesKhungGio }, (_, index) => (
                                <li
                                    key={index + 1}
                                    className={`page-item ${currentPageKhungGio === index + 1 ? 'active' : ''}`}
                                >
                                    <button className="page-link" onClick={() => paginateKhungGio(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            ) : (
                <p>Không có khung giờ nào.</p>
            )}
        </div>
    );

    const renderTaiKhoan = () => (
        <div>
            <h2>Tài khoản</h2>
            <p><strong>Email:</strong> {userInfo.email || 'N/A'}</p>
            <p><strong>Họ và tên:</strong> {userInfo.ho_va_ten || 'N/A'}</p>
            <p><strong>Vai trò:</strong> {userInfo.vai_tro === 'quan_tri' ? 'Quản trị viên' : 'N/A'}</p>
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
    );

    return (
        <div className="d-flex">
            <div className="sidebar d-none d-md-block">
                <h4 className="text-muted">{userInfo.email || 'N/A'}</h4>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${currentSection === 'tong-quan' ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSection('tong-quan');
                                setValidationError('');
                            }}
                        >
                            Tổng quan
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${currentSection === 'quan-ly-lich-hen' ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSection('quan-ly-lich-hen');
                                setValidationError('');
                            }}
                        >
                            Quản lý lịch hẹn
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${currentSection === 'phan-cong-nhan-vien' ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSection('phan-cong-nhan-vien');
                                setValidationError('');
                            }}
                        >
                            Phân công nhân viên
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${currentSection === 'bao-cao-thong-ke' ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSection('bao-cao-thong-ke');
                                setValidationError('');
                            }}
                        >
                            Báo cáo và thống kê
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${currentSection === 'quan-ly-tai-khoan' ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSection('quan-ly-tai-khoan');
                                setValidationError('');
                            }}
                        >
                            Quản lý tài khoản
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${currentSection === 'quan-ly-gara' ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSection('quan-ly-gara');
                                setValidationError('');
                            }}
                        >
                            Quản lý gara
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${currentSection === 'quan-ly-dich-vu' ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSection('quan-ly-dich-vu');
                                setValidationError('');
                            }}
                        >
                            Quản lý dịch vụ
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${currentSection === 'quan-ly-khung-gio' ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSection('quan-ly-khung-gio');
                                setValidationError('');
                            }}
                        >
                            Quản lý khung giờ
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${currentSection === 'tai-khoan' ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSection('tai-khoan');
                                setValidationError('');
                            }}
                        >
                            Tài khoản
                        </button>
                    </li>
                </ul>
            </div>

            <div className="offcanvas offcanvas-start" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title text-muted" id="sidebarMenuLabel">
                        {userInfo.email || 'N/A'}
                    </h5>
                    <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${currentSection === 'tong-quan' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSection('tong-quan');
                                    setValidationError('');
                                    document.getElementById('sidebarMenu').classList.remove('show');
                                }}
                            >
                                Tổng quan
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${currentSection === 'quan-ly-lich-hen' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSection('quan-ly-lich-hen');
                                    setValidationError('');
                                    document.getElementById('sidebarMenu').classList.remove('show');
                                }}
                            >
                                Quản lý lịch hẹn
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${currentSection === 'phan-cong-nhan-vien' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSection('phan-cong-nhan-vien');
                                    setValidationError('');
                                    document.getElementById('sidebarMenu').classList.remove('show');
                                }}
                            >
                                Phân công nhân viên
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${currentSection === 'bao-cao-thong-ke' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSection('bao-cao-thong-ke');
                                    setValidationError('');
                                    document.getElementById('sidebarMenu').classList.remove('show');
                                }}
                            >
                                Báo cáo và thống kê
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${currentSection === 'quan-ly-tai-khoan' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSection('quan-ly-tai-khoan');
                                    setValidationError('');
                                    document.getElementById('sidebarMenu').classList.remove('show');
                                }}
                            >
                                Quản lý tài khoản
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${currentSection === 'quan-ly-gara' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSection('quan-ly-gara');
                                    setValidationError('');
                                    document.getElementById('sidebarMenu').classList.remove('show');
                                }}
                            >
                                Quản lý gara
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${currentSection === 'quan-ly-dich-vu' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSection('quan-ly-dich-vu');
                                    setValidationError('');
                                    document.getElementById('sidebarMenu').classList.remove('show');
                                }}
                            >
                                Quản lý dịch vụ
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${currentSection === 'quan-ly-khung-gio' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSection('quan-ly-khung-gio');
                                    setValidationError('');
                                    document.getElementById('sidebarMenu').classList.remove('show');
                                }}
                            >
                                Quản lý khung giờ
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${currentSection === 'tai-khoan' ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSection('tai-khoan');
                                    setValidationError('');
                                    document.getElementById('sidebarMenu').classList.remove('show');
                                }}
                            >
                                Tài khoản
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex-grow-1">
                <div className="p-4">
                    <button
                        className="btn btn-primary d-md-none mb-3"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#sidebarMenu"
                        aria-controls="sidebarMenu"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <h1>Dashboard Quản trị viên</h1>
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    {currentSection === 'tong-quan' && renderTongQuan()}
                    {currentSection === 'quan-ly-lich-hen' && renderQuanLyLichHen()}
                    {currentSection === 'phan-cong-nhan-vien' && renderPhanCongNhanVien()}
                    {currentSection === 'bao-cao-thong-ke' && renderBaoCaoThongKe()}
                    {currentSection === 'quan-ly-tai-khoan' && renderQuanLyTaiKhoan()}
                    {currentSection === 'quan-ly-gara' && renderQuanLyGara()}
                    {currentSection === 'quan-ly-dich-vu' && renderQuanLyDichVu()}
                    {currentSection === 'quan-ly-khung-gio' && renderQuanLyKhungGio()}
                    {currentSection === 'tai-khoan' && renderTaiKhoan()}
                </div>
            </div>
        </div>
    );
};

export default DashboardQuanTri;