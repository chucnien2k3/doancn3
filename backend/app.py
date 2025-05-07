from flask import Flask
from flask_restful import Api
from flask_jwt_extended import JWTManager
from config.config import Config
from database import db
from resources.register import Register
from resources.lich_hen import LichHenResource
from resources.khach_hang import ThongTinKhachHang
from resources.nhan_vien import ThongTinNhanVien
from resources.quan_tri import ThongTinQuanTri
from resources.login import Login
from resources.quan_tri import GaraQuanTri
from resources.quan_tri import DichVuQuanTri
from resources.khach_hang import GaraList
from resources.quan_tri import KhungGioQuanTri
from resources.khach_hang import LichHenList, LichHenDetail, ThongBaoList, DichVuList, KhungGioList, BaoCaoLichHen
from resources.nhan_vien import LichHenNhanVien, ThongBaoNhanVien, ChiTietBaoDuongResource
from resources.quan_tri import LichHenQuanTri, PhanCongQuanTri, BaoCaoQuanTri, NhanVienRanhQuanTri, NguoiDungQuanTri
from flask_cors import CORS
import logging

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)
api = Api(app)

# Cấu hình CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Gắn db với app
db.init_app(app)

# Khởi tạo JWT
jwt = JWTManager(app)

# Thêm log khi khởi tạo JWT
logger.debug("Khởi tạo Flask-JWT-Extended với JWT_SECRET_KEY: %s", app.config['JWT_SECRET_KEY'])

# Xử lý lỗi token không hợp lệ
@jwt.invalid_token_loader
def invalid_token_callback(error):
    logger.error(f"Token không hợp lệ: {error}")
    return {'message': 'Token không hợp lệ', 'error': str(error)}, 422

# Xử lý lỗi token hết hạn
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    logger.error("Token đã hết hạn")
    return {'message': 'Token đã hết hạn'}, 401

# Thêm resources
api.add_resource(Register, '/register')
api.add_resource(Login, '/login')
api.add_resource(LichHenList, '/dashboard/khach-hang/lich-hen')
api.add_resource(LichHenDetail, '/lich-hen/<int:id>')
api.add_resource(ThongBaoList, '/dashboard/khach-hang/thong-bao')
api.add_resource(DichVuList, '/dich-vu')
api.add_resource(KhungGioList, '/khung-gio')
api.add_resource(BaoCaoLichHen, '/lich-hen/<int:id>/bao-cao')
api.add_resource(LichHenNhanVien, '/dashboard/nhan-vien/lich-hen')
api.add_resource(ThongBaoNhanVien, '/dashboard/nhan-vien/thong-bao')
api.add_resource(ChiTietBaoDuongResource, '/lich-hen/<int:id>/bao-duong')
api.add_resource(LichHenQuanTri, '/dashboard/quan-tri/lich-hen', '/dashboard/quan-tri/lich-hen/<int:id>')
api.add_resource(PhanCongQuanTri, '/dashboard/quan-tri/phan-cong', '/dashboard/quan-tri/phan-cong/<int:lich_hen_id>')
api.add_resource(NhanVienRanhQuanTri, '/dashboard/quan-tri/nhan-vien-ranh')
api.add_resource(BaoCaoQuanTri, '/dashboard/quan-tri/bao-cao')
api.add_resource(NguoiDungQuanTri, '/dashboard/quan-tri/nguoi-dung', '/dashboard/quan-tri/nguoi-dung/<int:user_id>')
api.add_resource(LichHenResource, '/lich-hen/<int:id>')
api.add_resource(ThongTinKhachHang, '/dashboard/khach-hang/thong-tin')
api.add_resource(ThongTinNhanVien, '/dashboard/nhan-vien/thong-tin')
api.add_resource(ThongTinQuanTri, '/dashboard/quan-tri/thong-tin')
api.add_resource(GaraList, '/gara')
api.add_resource(GaraQuanTri, '/dashboard/quan-tri/gara', '/dashboard/quan-tri/gara/<int:gara_id>')
api.add_resource(DichVuQuanTri, '/dashboard/quan-tri/dich-vu', '/dashboard/quan-tri/dich-vu/<int:dich_vu_id>')
api.add_resource(KhungGioQuanTri, '/dashboard/quan-tri/khung-gio', '/dashboard/quan-tri/khung-gio/<int:khung_gio_id>')

@app.route('/')
def home():
    return {'message': 'Welcome to Car Service API!'}

# Import model để db.create_all() nhận diện
from models.user import NguoiDung
from models.lich_hen import LichHen
from models.dich_vu import DichVu
from models.khung_gio import KhungGio
from models.thong_bao import ThongBao
from models.nhan_vien import NhanVien
from models.phan_cong_nhan_vien import PhanCongNhanVien
from models.chi_tiet_bao_duong import ChiTietBaoDuong
from models.gara import Gara

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Tạo bảng nếu chưa có
    app.run(debug=True)