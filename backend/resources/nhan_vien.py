from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.lich_hen import LichHen
from models.phan_cong_nhan_vien import PhanCongNhanVien
from models.user import NguoiDung
from models.nhan_vien import NhanVien
from models.dich_vu import DichVu
from models.khung_gio import KhungGio
from models.thong_bao import ThongBao
from models.chi_tiet_bao_duong import ChiTietBaoDuong
from database import db
import logging

logger = logging.getLogger(__name__)

class LichHenNhanVien(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'nhan_vien':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ nhân viên mới có thể truy cập API này'}, 403

            nhan_vien = db.session.query(NhanVien).filter_by(user_id=user_id).first()
            if not nhan_vien:
                logger.error(f"Nhân viên không tồn tại trong bảng NhanVien: user_id={user_id}")
                return {'message': f'Nhân viên với user_id={user_id} không tồn tại. Vui lòng kiểm tra bảng NhanVien hoặc liên hệ quản trị viên.'}, 404

            # Sử dụng left join để vẫn lấy được lịch hẹn ngay cả khi dich_vu hoặc khung_gio không tồn tại
            lich_hens = (
                db.session.query(LichHen, NguoiDung, DichVu, KhungGio)
                .join(PhanCongNhanVien, PhanCongNhanVien.lich_hen_id == LichHen.id)
                .join(NguoiDung, NguoiDung.id == LichHen.nguoi_dung_id)
                .outerjoin(DichVu, DichVu.id == LichHen.dich_vu_id)  # Sử dụng outerjoin
                .outerjoin(KhungGio, KhungGio.id == LichHen.khung_gio_id)  # Sử dụng outerjoin
                .filter(PhanCongNhanVien.nhan_vien_id == nhan_vien.id)
                .all()
            )

            logger.debug(f"Lấy danh sách lịch hẹn thành công cho nhân viên: user_id={user_id}")
            result = []
            for lich_hen, khach_hang, dich_vu, khung_gio in lich_hens:
                # Kiểm tra dữ liệu
                if not dich_vu:
                    logger.warning(f"Dịch vụ không tồn tại cho lịch hẹn: lich_hen_id={lich_hen.id}")
                if not khung_gio:
                    logger.warning(f"Khung giờ không tồn tại cho lịch hẹn: lich_hen_id={lich_hen.id}")

                result.append({
                    'id': lich_hen.id,
                    'khach_hang': {
                        'email': khach_hang.email if khach_hang else 'N/A',
                        'ho_va_ten': khach_hang.ho_va_ten if khach_hang else 'N/A'
                    },
                    'dich_vu': {'ten_dich_vu': dich_vu.ten_dich_vu if dich_vu else 'N/A'},
                    'khung_gio': {
                        'thoi_gian_bat_dau': str(khung_gio.thoi_gian_bat_dau) if khung_gio else 'N/A',
                        'thoi_gian_ket_thuc': str(khung_gio.thoi_gian_ket_thuc) if khung_gio else 'N/A'
                    },
                    'ngay_hen': lich_hen.ngay_hen.isoformat() if lich_hen.ngay_hen else None,
                    'trang_thai': lich_hen.trang_thai,
                    'thoi_gian_tao': lich_hen.thoi_gian_tao.isoformat() if lich_hen.thoi_gian_tao else None
                })

            logger.debug(f"Dữ liệu lịch hẹn trả về: {result}")
            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách lịch hẹn: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách lịch hẹn: {str(e)}'}, 500

class ThongBaoNhanVien(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'nhan_vien':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ nhân viên mới có thể truy cập API này'}, 403

            nhan_vien = db.session.query(NhanVien).filter_by(user_id=user_id).first()
            if not nhan_vien:
                logger.error(f"Nhân viên không tồn tại trong bảng NhanVien: user_id={user_id}")
                return {'message': f'Nhân viên với user_id={user_id} không tồn tại. Vui lòng kiểm tra bảng NhanVien hoặc liên hệ quản trị viên.'}, 404

            thong_baos = db.session.query(ThongBao).filter_by(nguoi_dung_id=user_id).all()
            logger.debug(f"Lấy danh sách thông báo thành công cho nhân viên: user_id={user_id}")
            result = [
                {
                    'id': tb.id,
                    'loai_thong_bao': tb.loai_thong_bao,
                    'noi_dung': tb.noi_dung,
                    'thoi_gian_gui': tb.thoi_gian_gui.isoformat() if tb.thoi_gian_gui else None
                }
                for tb in thong_baos
            ]

            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách thông báo: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách thông báo: {str(e)}'}, 500

class ChiTietBaoDuongResource(Resource):
    @jwt_required()
    def post(self, id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'nhan_vien':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ nhân viên mới có thể truy cập API này'}, 403

            nhan_vien = db.session.query(NhanVien).filter_by(user_id=user_id).first()
            if not nhan_vien:
                logger.error(f"Nhân viên không tồn tại trong bảng NhanVien: user_id={user_id}")
                return {'message': f'Nhân viên với user_id={user_id} không tồn tại. Vui lòng kiểm tra bảng NhanVien hoặc liên hệ quản trị viên.'}, 404

            lich_hen = (
                db.session.query(LichHen)
                .join(PhanCongNhanVien, PhanCongNhanVien.lich_hen_id == LichHen.id)
                .filter(LichHen.id == id, PhanCongNhanVien.nhan_vien_id == nhan_vien.id)
                .first()
            )
            if not lich_hen:
                logger.error(f"Lịch hẹn không tồn tại hoặc không được phân công cho nhân viên: lich_hen_id={id}, nhan_vien_id={nhan_vien.id}")
                return {'message': 'Lịch hẹn không tồn tại hoặc không được phân công cho bạn'}, 404

            if lich_hen.trang_thai not in ['da_xac_nhan', 'dang_thuc_hien']:
                logger.error(f"Không thể ghi chi tiết bảo dưỡng cho lịch hẹn có trạng thái: {lich_hen.trang_thai}")
                return {'message': 'Không thể ghi chi tiết bảo dưỡng cho lịch hẹn này do trạng thái không phù hợp'}, 400

            data = request.get_json()
            phu_tung_da_dung = data.get('phu_tung_da_dung', '')
            thoi_gian_thuc_te = data.get('thoi_gian_thuc_te', 0)
            ghi_chu = data.get('ghi_chu', '')
            bao_gia = data.get('bao_gia', 0)

            if not isinstance(bao_gia, (int, float)):
                logger.error(f"Giá trị báo giá không hợp lệ: bao_gia={bao_gia}")
                return {'message': 'Giá trị báo giá phải là số'}, 400

            if bao_gia < 0:
                logger.error(f"Giá trị báo giá không được âm: bao_gia={bao_gia}")
                return {'message': 'Giá trị báo giá không được âm'}, 400

            if bao_gia > 9999999999999.99:
                logger.error(f"Giá trị báo giá vượt quá giới hạn: bao_gia={bao_gia}")
                return {'message': 'Giá trị báo giá vượt quá giới hạn cho phép (tối đa 9999999999999.99)'}, 400

            chi_tiet = ChiTietBaoDuong(
                lich_hen_id=id,
                phu_tung_da_dung=phu_tung_da_dung,
                thoi_gian_thuc_te=thoi_gian_thuc_te,
                ghi_chu=ghi_chu,
                bao_gia=bao_gia
            )
            db.session.add(chi_tiet)

            lich_hen.trang_thai = 'da_hoan_thanh'
            db.session.commit()

            logger.debug(f"Ghi chi tiết bảo dưỡng thành công: lich_hen_id={id}")
            return {'message': 'Ghi chi tiết bảo dưỡng thành công'}, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi ghi chi tiết bảo dưỡng: {str(e)}")
            return {'message': f'Lỗi khi ghi chi tiết bảo dưỡng: {str(e)}'}, 500
        
class ThongTinNhanVien(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if not user:
                logger.error(f"Người dùng không tồn tại: user_id={user_id}")
                return {'message': 'Người dùng không tồn tại'}, 404

            if user.vai_tro != 'nhan_vien':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ nhân viên mới có thể truy cập API này'}, 403

            logger.debug(f"Lấy thông tin nhân viên thành công: user_id={user_id}")
            return {
                'email': user.email,
                'ho_va_ten': user.ho_va_ten,
                'vai_tro': user.vai_tro
            }, 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy thông tin nhân viên: {str(e)}")
            return {'message': f'Lỗi khi lấy thông tin nhân viên: {str(e)}'}, 500