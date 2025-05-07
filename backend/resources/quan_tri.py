from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.lich_hen import LichHen
from models.phan_cong_nhan_vien import PhanCongNhanVien
from models.user import NguoiDung
from models.nhan_vien import NhanVien
from models.dich_vu import DichVu
from models.khung_gio import KhungGio
from models.chi_tiet_bao_duong import ChiTietBaoDuong
from models.thong_bao import ThongBao
from models.gara import Gara
from database import db
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class LichHenQuanTri(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            trang_thai = request.args.get('trang_thai')
            ngay_hen = request.args.get('ngay_hen')

            query = (
                db.session.query(LichHen, NguoiDung, DichVu, KhungGio)
                .join(NguoiDung, NguoiDung.id == LichHen.nguoi_dung_id)
                .join(DichVu, DichVu.id == LichHen.dich_vu_id)
                .join(KhungGio, KhungGio.id == LichHen.khung_gio_id)
            )

            if trang_thai:
                query = query.filter(LichHen.trang_thai == trang_thai)
            if ngay_hen:
                query = query.filter(LichHen.ngay_hen == ngay_hen)

            lich_hens = query.all()

            result = [
                {
                    'id': lich_hen.id,
                    'khach_hang': {'email': khach_hang.email, 'ho_va_ten': khach_hang.ho_va_ten},
                    'dich_vu': {'ten_dich_vu': dich_vu.ten_dich_vu},
                    'khung_gio': {
                        'thoi_gian_bat_dau': str(khung_gio.thoi_gian_bat_dau),
                        'thoi_gian_ket_thuc': str(khung_gio.thoi_gian_ket_thuc),
                        'so_nhan_vien_ranh': khung_gio.so_nhan_vien_ranh
                    },
                    'ngay_hen': lich_hen.ngay_hen.isoformat() if lich_hen.ngay_hen else None,
                    'trang_thai': lich_hen.trang_thai,
                    'thoi_gian_tao': lich_hen.thoi_gian_tao.isoformat() if lich_hen.thoi_gian_tao else None
                }
                for lich_hen, khach_hang, dich_vu, khung_gio in lich_hens
            ]

            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách lịch hẹn: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách lịch hẹn: {str(e)}'}, 500

    @jwt_required()
    def put(self, id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            lich_hen = db.session.query(LichHen).filter_by(id=id).first()
            if not lich_hen:
                logger.error(f"Lịch hẹn không tồn tại: id={id}")
                return {'message': 'Lịch hẹn không tồn tại'}, 404

            data = request.get_json()
            trang_thai = data.get('trang_thai')

            if trang_thai not in ['dang_cho', 'da_xac_nhan', 'da_hoan_thanh', 'da_huy']:
                logger.error(f"Trạng thái không hợp lệ: trang_thai={trang_thai}")
                return {'message': 'Trạng thái không hợp lệ'}, 400

            lich_hen.trang_thai = trang_thai
            db.session.commit()

            logger.debug(f"Cập nhật trạng thái lịch hẹn thành công: id={id}, trang_thai={trang_thai}")
            return {'message': 'Cập nhật trạng thái lịch hẹn thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi cập nhật trạng thái lịch hẹn: {str(e)}")
            return {'message': f'Lỗi khi cập nhật trạng thái lịch hẹn: {str(e)}'}, 500

class PhanCongQuanTri(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            phan_congs = (
                db.session.query(PhanCongNhanVien, LichHen, NhanVien, NguoiDung)
                .join(LichHen, LichHen.id == PhanCongNhanVien.lich_hen_id)
                .join(NhanVien, NhanVien.id == PhanCongNhanVien.nhan_vien_id)
                .join(NguoiDung, NguoiDung.id == NhanVien.user_id)
                .all()
            )

            result = [
                {
                    'lich_hen_id': phan_cong.lich_hen_id,
                    'nhan_vien': {'id': nhan_vien.user_id, 'ho_va_ten': nhan_vien.ho_va_ten},
                    'ngay_hen': lich_hen.ngay_hen.isoformat() if lich_hen.ngay_hen else None,
                    'trang_thai': lich_hen.trang_thai
                }
                for phan_cong, lich_hen, nhan_vien, nguoi_dung in phan_congs
            ]

            logger.debug(f"Danh sách phân công: {result}")
            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách phân công: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách phân công: {str(e)}'}, 500

    @jwt_required()
    def put(self, lich_hen_id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            lich_hen = db.session.query(LichHen).filter_by(id=lich_hen_id).first()
            if not lich_hen:
                logger.error(f"Lịch hẹn không tồn tại: id={lich_hen_id}")
                return {'message': 'Lịch hẹn không tồn tại'}, 404

            data = request.get_json()
            nhan_vien_id = data.get('nhan_vien_id')

            nguoi_dung = db.session.query(NguoiDung).filter_by(id=nhan_vien_id).first()
            if not nguoi_dung or nguoi_dung.vai_tro != 'nhan_vien':
                logger.error(f"Nhân viên không tồn tại hoặc không có vai trò phù hợp: id={nhan_vien_id}")
                return {'message': 'Nhân viên không tồn tại hoặc không có vai trò phù hợp'}, 404

            nhan_vien = db.session.query(NhanVien).filter_by(user_id=nhan_vien_id).first()
            if not nhan_vien:
                logger.info(f"Tạo bản ghi mới trong bảng NhanVien cho user_id={nhan_vien_id}")
                nhan_vien = NhanVien(
                    user_id=nhan_vien_id,
                    ho_va_ten=nguoi_dung.ho_va_ten,
                    ky_nang='Kỹ năng cơ bản',
                    lich_lam_viec={}
                )
                db.session.add(nhan_vien)
                db.session.flush()

            db.session.query(PhanCongNhanVien).filter_by(lich_hen_id=lich_hen_id).delete()

            phan_cong = PhanCongNhanVien(lich_hen_id=lich_hen_id, nhan_vien_id=nhan_vien.id)
            db.session.add(phan_cong)
            db.session.commit()

            logger.debug(f"Phân công nhân viên thành công: lich_hen_id={lich_hen_id}, nhan_vien_id={nhan_vien.id}")
            return {'message': 'Phân công nhân viên thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi phân công nhân viên: {str(e)}")
            return {'message': f'Lỗi khi phân công nhân viên: {str(e)}'}, 500

    @jwt_required()
    def delete(self, lich_hen_id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            lich_hen = db.session.query(LichHen).filter_by(id=lich_hen_id).first()
            if not lich_hen:
                logger.error(f"Lịch hẹn không tồn tại: id={lich_hen_id}")
                return {'message': 'Lịch hẹn không tồn tại'}, 404

            deleted_rows = db.session.query(PhanCongNhanVien).filter_by(lich_hen_id=lich_hen_id).delete()
            if deleted_rows == 0:
                logger.warning(f"Không tìm thấy phân công cho lịch hẹn: id={lich_hen_id}")
                return {'message': 'Không tìm thấy phân công để hủy'}, 404

            db.session.commit()
            logger.debug(f"Hủy phân công thành công: lich_hen_id={lich_hen_id}")
            return {'message': 'Hủy phân công thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi hủy phân công: {str(e)}")
            return {'message': f'Lỗi khi hủy phân công: {str(e)}'}, 500

class NhanVienRanhQuanTri(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            ngay_hen = request.args.get('ngay_hen')
            khung_gio_id = request.args.get('khung_gio_id')

            if not ngay_hen or not khung_gio_id:
                logger.error("Thiếu tham số ngay_hen hoặc khung_gio_id")
                return {'message': 'Vui lòng cung cấp ngay_hen và khung_gio_id'}, 400

            khung_gio = db.session.query(KhungGio).filter_by(id=khung_gio_id).first()
            if not khung_gio:
                logger.error(f"Khung giờ không tồn tại: id={khung_gio_id}")
                return {'message': 'Khung giờ không tồn tại'}, 404

            total_available_slots = khung_gio.so_nhan_vien_ranh

            lich_hens = (
                db.session.query(LichHen)
                .filter(LichHen.ngay_hen == ngay_hen, LichHen.khung_gio_id == khung_gio_id)
                .all()
            )

            lich_hen_ids = [lich_hen.id for lich_hen in lich_hens]

            phan_congs = (
                db.session.query(PhanCongNhanVien)
                .filter(PhanCongNhanVien.lich_hen_id.in_(lich_hen_ids))
                .all()
            )

            nhan_vien_da_phan_cong = {phan_cong.nhan_vien_id for phan_cong in phan_congs}

            tat_ca_nhan_vien = db.session.query(NhanVien).all()

            all_lich_hens = (
                db.session.query(LichHen, NguoiDung)
                .join(NguoiDung, NguoiDung.id == LichHen.nguoi_dung_id)
                .filter(LichHen.ngay_hen == ngay_hen, LichHen.khung_gio_id == khung_gio_id)
                .all()
            )

            nguoi_dung_da_co_lich = {lich_hen.nguoi_dung_id for lich_hen, nguoi_dung in all_lich_hens}

            nhan_vien_ranh = [
                {
                    'id': nhan_vien.user_id,
                    'ho_va_ten': nhan_vien.ho_va_ten
                }
                for nhan_vien in tat_ca_nhan_vien
                if nhan_vien.id not in nhan_vien_da_phan_cong and nhan_vien.user_id not in nguoi_dung_da_co_lich
            ]

            if len(nhan_vien_ranh) > total_available_slots:
                nhan_vien_ranh = nhan_vien_ranh[:total_available_slots]

            return nhan_vien_ranh if nhan_vien_ranh else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách nhân viên rảnh: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách nhân viên rảnh: {str(e)}'}, 500

class BaoCaoQuanTri(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            lich_hen_stats = db.session.query(
                LichHen.trang_thai,
                db.func.count(LichHen.id).label('so_luong')
            ).group_by(LichHen.trang_thai).all()

            dich_vu_stats = db.session.query(
                DichVu.ten_dich_vu,
                db.func.count(LichHen.id).label('so_luong')
            ).join(LichHen, LichHen.dich_vu_id == DichVu.id).group_by(DichVu.id).all()

            nhan_vien_stats = db.session.query(
                NguoiDung.ho_va_ten,
                db.func.count(PhanCongNhanVien.lich_hen_id).label('so_lich_hen'),
                db.func.avg(ChiTietBaoDuong.thoi_gian_thuc_te).label('thoi_gian_trung_binh')
            ).join(PhanCongNhanVien, PhanCongNhanVien.nhan_vien_id == NguoiDung.id)\
             .join(ChiTietBaoDuong, ChiTietBaoDuong.lich_hen_id == PhanCongNhanVien.lich_hen_id, isouter=True)\
             .group_by(NguoiDung.id).filter(NguoiDung.vai_tro == 'nhan_vien').all()

            result = {
                'lich_hen_stats': [
                    {'trang_thai': stat.trang_thai, 'so_luong': stat.so_luong}
                    for stat in lich_hen_stats
                ],
                'dich_vu_stats': [
                    {'ten_dich_vu': stat.ten_dich_vu, 'so_luong': stat.so_luong}
                    for stat in dich_vu_stats
                ],
                'nhan_vien_stats': [
                    {
                        'ho_va_ten': stat.ho_va_ten,
                        'so_lich_hen': stat.so_lich_hen,
                        'thoi_gian_trung_binh': float(stat.thoi_gian_trung_binh) if stat.thoi_gian_trung_binh else None
                    }
                    for stat in nhan_vien_stats
                ]
            }

            return result, 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy báo cáo: {str(e)}")
            return {'message': f'Lỗi khi lấy báo cáo: {str(e)}'}, 500

class NguoiDungQuanTri(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            nguoi_dungs = db.session.query(NguoiDung).all()
            result = [
                {
                    'id': nguoi_dung.id,
                    'email': nguoi_dung.email,
                    'so_dien_thoai': nguoi_dung.so_dien_thoai,
                    'vai_tro': nguoi_dung.vai_tro,
                    'ho_va_ten': nguoi_dung.ho_va_ten
                }
                for nguoi_dung in nguoi_dungs
            ]
            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách người dùng: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách người dùng: {str(e)}'}, 500

    @jwt_required()
    def put(self, user_id):
        try:
            current_user_id = get_jwt_identity()
            current_user = db.session.query(NguoiDung).filter_by(id=current_user_id).first()
            if current_user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={current_user_id}, vai_tro={current_user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if not user:
                logger.error(f"Người dùng không tồn tại: id={user_id}")
                return {'message': 'Người dùng không tồn tại'}, 404

            data = request.get_json()
            email = data.get('email')
            so_dien_thoai = data.get('so_dien_thoai')
            vai_tro = data.get('vai_tro')
            ho_va_ten = data.get('ho_va_ten')

            if vai_tro not in ['khach_hang', 'nhan_vien', 'quan_tri']:
                logger.error(f"Vai trò không hợp lệ: vai_tro={vai_tro}")
                return {'message': 'Vai trò không hợp lệ'}, 400

            if vai_tro == 'nhan_vien' and user.vai_tro != 'nhan_vien':
                nhan_vien = db.session.query(NhanVien).filter_by(user_id=user_id).first()
                if not nhan_vien:
                    new_nhan_vien = NhanVien(
                        user_id=user_id,
                        ho_va_ten=ho_va_ten if ho_va_ten else user.ho_va_ten,
                        ky_nang='Kỹ năng cơ bản',
                        lich_lam_viec={}
                    )
                    db.session.add(new_nhan_vien)

            if vai_tro != 'nhan_vien' and user.vai_tro == 'nhan_vien':
                db.session.query(NhanVien).filter_by(user_id=user_id).delete()

            user.email = email
            user.so_dien_thoai = so_dien_thoai
            user.vai_tro = vai_tro
            user.ho_va_ten = ho_va_ten if ho_va_ten else user.ho_va_ten
            db.session.commit()

            logger.debug(f"Cập nhật người dùng thành công: id={user_id}")
            return {'message': 'Cập nhật người dùng thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi cập nhật người dùng: {str(e)}")
            return {'message': f'Lỗi khi cập nhật người dùng: {str(e)}'}, 500

    @jwt_required()
    def delete(self, user_id):
        try:
            current_user_id = get_jwt_identity()
            current_user = db.session.query(NguoiDung).filter_by(id=current_user_id).first()
            if current_user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={current_user_id}, vai_tro={current_user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if not user:
                logger.error(f"Người dùng không tồn tại: id={user_id}")
                return {'message': 'Người dùng không tồn tại'}, 404

            db.session.query(NhanVien).filter_by(user_id=user_id).delete()

            db.session.delete(user)
            db.session.commit()

            logger.debug(f"Xóa người dùng thành công: id={user_id}")
            return {'message': 'Xóa người dùng thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi xóa người dùng: {str(e)}")
            return {'message': f'Lỗi khi xóa người dùng: {str(e)}'}, 500

class ThongTinQuanTri(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if not user:
                logger.error(f"Người dùng không tồn tại: user_id={user_id}")
                return {'message': 'Người dùng không tồn tại'}, 404

            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            logger.debug(f"Lấy thông tin quản trị viên thành công: user_id={user_id}")
            return {
                'email': user.email,
                'ho_va_ten': user.ho_va_ten,
                'vai_tro': user.vai_tro
            }, 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy thông tin quản trị viên: {str(e)}")
            return {'message': f'Lỗi khi lấy thông tin quản trị viên: {str(e)}'}, 500

class GaraQuanTri(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            garas = db.session.query(Gara).all()
            result = [
                {
                    'id': gara.id,
                    'ten_gara': gara.ten_gara,
                    'dia_chi': gara.dia_chi,
                    'so_dien_thoai': gara.so_dien_thoai,
                    'trang_thai': gara.trang_thai
                }
                for gara in garas
            ]
            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách gara: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách gara: {str(e)}'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            data = request.get_json()
            ten_gara = data.get('ten_gara')
            dia_chi = data.get('dia_chi')
            so_dien_thoai = data.get('so_dien_thoai')
            trang_thai = data.get('trang_thai', 'hoat_dong')

            if not ten_gara or not dia_chi:
                logger.error("Thiếu thông tin bắt buộc: ten_gara hoặc dia_chi")
                return {'message': 'Tên gara và địa chỉ là bắt buộc'}, 400

            if trang_thai not in ['hoat_dong', 'tam_ngung']:
                logger.error(f"Trạng thái không hợp lệ: trang_thai={trang_thai}")
                return {'message': 'Trạng thái không hợp lệ'}, 400

            new_gara = Gara(
                ten_gara=ten_gara,
                dia_chi=dia_chi,
                so_dien_thoai=so_dien_thoai,
                trang_thai=trang_thai
            )
            db.session.add(new_gara)
            db.session.commit()

            logger.debug(f"Thêm gara thành công: ten_gara={ten_gara}")
            return {'message': 'Thêm gara thành công'}, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi thêm gara: {str(e)}")
            return {'message': f'Lỗi khi thêm gara: {str(e)}'}, 500

    @jwt_required()
    def put(self, gara_id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            gara = db.session.query(Gara).filter_by(id=gara_id).first()
            if not gara:
                logger.error(f"Gara không tồn tại: id={gara_id}")
                return {'message': 'Gara không tồn tại'}, 404

            data = request.get_json()
            ten_gara = data.get('ten_gara')
            dia_chi = data.get('dia_chi')
            so_dien_thoai = data.get('so_dien_thoai')
            trang_thai = data.get('trang_thai')

            if not ten_gara or not dia_chi:
                logger.error("Thiếu thông tin bắt buộc: ten_gara hoặc dia_chi")
                return {'message': 'Tên gara và địa chỉ là bắt buộc'}, 400

            if trang_thai not in ['hoat_dong', 'tam_ngung']:
                logger.error(f"Trạng thái không hợp lệ: trang_thai={trang_thai}")
                return {'message': 'Trạng thái không hợp lệ'}, 400

            gara.ten_gara = ten_gara
            gara.dia_chi = dia_chi
            gara.so_dien_thoai = so_dien_thoai
            gara.trang_thai = trang_thai
            db.session.commit()

            logger.debug(f"Cập nhật gara thành công: id={gara_id}")
            return {'message': 'Cập nhật gara thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi cập nhật gara: {str(e)}")
            return {'message': f'Lỗi khi cập nhật gara: {str(e)}'}, 500

    @jwt_required()
    def delete(self, gara_id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            gara = db.session.query(Gara).filter_by(id=gara_id).first()
            if not gara:
                logger.error(f"Gara không tồn tại: id={gara_id}")
                return {'message': 'Gara không tồn tại'}, 404

            db.session.delete(gara)
            db.session.commit()

            logger.debug(f"Xóa gara thành công: id={gara_id}")
            return {'message': 'Xóa gara thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi xóa gara: {str(e)}")
            return {'message': f'Lỗi khi xóa gara: {str(e)}'}, 500

class DichVuQuanTri(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            dich_vus = db.session.query(DichVu).all()
            result = [
                {
                    'id': dich_vu.id,
                    'ten_dich_vu': dich_vu.ten_dich_vu,
                    'mo_ta': dich_vu.mo_ta,
                    'thoi_gian_du_kien': dich_vu.thoi_gian_du_kien
                }
                for dich_vu in dich_vus
            ]
            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách dịch vụ: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách dịch vụ: {str(e)}'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            data = request.get_json()
            ten_dich_vu = data.get('ten_dich_vu')
            mo_ta = data.get('mo_ta')
            thoi_gian_du_kien = data.get('thoi_gian_du_kien')

            if not ten_dich_vu or not thoi_gian_du_kien:
                logger.error("Thiếu thông tin bắt buộc: ten_dich_vu hoặc thoi_gian_du_kien")
                return {'message': 'Tên dịch vụ và thời gian dự kiến là bắt buộc'}, 400

            try:
                thoi_gian_du_kien = int(thoi_gian_du_kien)
                if thoi_gian_du_kien <= 0:
                    logger.error(f"Thời gian dự kiến không hợp lệ: thoi_gian_du_kien={thoi_gian_du_kien}")
                    return {'message': 'Thời gian dự kiến phải là số dương'}, 400
            except ValueError:
                logger.error(f"Thời gian dự kiến không hợp lệ: thoi_gian_du_kien={thoi_gian_du_kien}")
                return {'message': 'Thời gian dự kiến phải là một số nguyên'}, 400

            new_dich_vu = DichVu(
                ten_dich_vu=ten_dich_vu,
                mo_ta=mo_ta,
                thoi_gian_du_kien=thoi_gian_du_kien
            )
            db.session.add(new_dich_vu)
            db.session.commit()

            logger.debug(f"Thêm dịch vụ thành công: ten_dich_vu={ten_dich_vu}")
            return {'message': 'Thêm dịch vụ thành công'}, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi thêm dịch vụ: {str(e)}")
            return {'message': f'Lỗi khi thêm dịch vụ: {str(e)}'}, 500

    @jwt_required()
    def put(self, dich_vu_id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            dich_vu = db.session.query(DichVu).filter_by(id=dich_vu_id).first()
            if not dich_vu:
                logger.error(f"Dịch vụ không tồn tại: id={dich_vu_id}")
                return {'message': 'Dịch vụ không tồn tại'}, 404

            data = request.get_json()
            ten_dich_vu = data.get('ten_dich_vu')
            mo_ta = data.get('mo_ta')
            thoi_gian_du_kien = data.get('thoi_gian_du_kien')

            if not ten_dich_vu or not thoi_gian_du_kien:
                logger.error("Thiếu thông tin bắt buộc: ten_dich_vu hoặc thoi_gian_du_kien")
                return {'message': 'Tên dịch vụ và thời gian dự kiến là bắt buộc'}, 400

            try:
                thoi_gian_du_kien = int(thoi_gian_du_kien)
                if thoi_gian_du_kien <= 0:
                    logger.error(f"Thời gian dự kiến không hợp lệ: thoi_gian_du_kien={thoi_gian_du_kien}")
                    return {'message': 'Thời gian dự kiến phải là số dương'}, 400
            except ValueError:
                logger.error(f"Thời gian dự kiến không hợp lệ: thoi_gian_du_kien={thoi_gian_du_kien}")
                return {'message': 'Thời gian dự kiến phải là một số nguyên'}, 400

            dich_vu.ten_dich_vu = ten_dich_vu
            dich_vu.mo_ta = mo_ta
            dich_vu.thoi_gian_du_kien = thoi_gian_du_kien
            db.session.commit()

            logger.debug(f"Cập nhật dịch vụ thành công: id={dich_vu_id}")
            return {'message': 'Cập nhật dịch vụ thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi cập nhật dịch vụ: {str(e)}")
            return {'message': f'Lỗi khi cập nhật dịch vụ: {str(e)}'}, 500

    @jwt_required()
    def delete(self, dich_vu_id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            dich_vu = db.session.query(DichVu).filter_by(id=dich_vu_id).first()
            if not dich_vu:
                logger.error(f"Dịch vụ không tồn tại: id={dich_vu_id}")
                return {'message': 'Dịch vụ không tồn tại'}, 404

            db.session.delete(dich_vu)
            db.session.commit()

            logger.debug(f"Xóa dịch vụ thành công: id={dich_vu_id}")
            return {'message': 'Xóa dịch vụ thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi xóa dịch vụ: {str(e)}")
            return {'message': f'Lỗi khi xóa dịch vụ: {str(e)}'}, 500

class KhungGioQuanTri(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            khung_gios = db.session.query(KhungGio).all()
            result = [
                {
                    'id': khung_gio.id,
                    'thoi_gian_bat_dau': str(khung_gio.thoi_gian_bat_dau),
                    'thoi_gian_ket_thuc': str(khung_gio.thoi_gian_ket_thuc),
                    'so_nhan_vien_ranh': khung_gio.so_nhan_vien_ranh
                }
                for khung_gio in khung_gios
            ]
            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách khung giờ: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách khung giờ: {str(e)}'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            data = request.get_json()
            thoi_gian_bat_dau = data.get('thoi_gian_bat_dau')
            thoi_gian_ket_thuc = data.get('thoi_gian_ket_thuc')
            so_nhan_vien_ranh = data.get('so_nhan_vien_ranh', 0)

            if not thoi_gian_bat_dau or not thoi_gian_ket_thuc:
                logger.error("Thiếu thông tin bắt buộc: thoi_gian_bat_dau hoặc thoi_gian_ket_thuc")
                return {'message': 'Thời gian bắt đầu và thời gian kết thúc là bắt buộc'}, 400

            try:
                thoi_gian_bat_dau = datetime.strptime(thoi_gian_bat_dau, '%H:%M').time()
                thoi_gian_ket_thuc = datetime.strptime(thoi_gian_ket_thuc, '%H:%M').time()
            except ValueError:
                logger.error(f"Định dạng thời gian không hợp lệ: thoi_gian_bat_dau={thoi_gian_bat_dau}, thoi_gian_ket_thuc={thoi_gian_ket_thuc}")
                return {'message': 'Định dạng thời gian không hợp lệ (HH:MM)'}, 400

            if thoi_gian_bat_dau >= thoi_gian_ket_thuc:
                logger.error(f"Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc: thoi_gian_bat_dau={thoi_gian_bat_dau}, thoi_gian_ket_thuc={thoi_gian_ket_thuc}")
                return {'message': 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc'}, 400

            try:
                so_nhan_vien_ranh = int(so_nhan_vien_ranh)
                if so_nhan_vien_ranh < 0:
                    logger.error(f"Số nhân viên rảnh không hợp lệ: so_nhan_vien_ranh={so_nhan_vien_ranh}")
                    return {'message': 'Số nhân viên rảnh phải là số không âm'}, 400
            except ValueError:
                logger.error(f"Số nhân viên rảnh không hợp lệ: so_nhan_vien_ranh={so_nhan_vien_ranh}")
                return {'message': 'Số nhân viên rảnh phải là một số nguyên'}, 400

            new_khung_gio = KhungGio(
                thoi_gian_bat_dau=thoi_gian_bat_dau,
                thoi_gian_ket_thuc=thoi_gian_ket_thuc,
                so_nhan_vien_ranh=so_nhan_vien_ranh
            )
            db.session.add(new_khung_gio)
            db.session.commit()

            logger.debug(f"Thêm khung giờ thành công: thoi_gian_bat_dau={thoi_gian_bat_dau}, thoi_gian_ket_thuc={thoi_gian_ket_thuc}")
            return {'message': 'Thêm khung giờ thành công'}, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi thêm khung giờ: {str(e)}")
            return {'message': f'Lỗi khi thêm khung giờ: {str(e)}'}, 500

    @jwt_required()
    def put(self, khung_gio_id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            khung_gio = db.session.query(KhungGio).filter_by(id=khung_gio_id).first()
            if not khung_gio:
                logger.error(f"Khung giờ không tồn tại: id={khung_gio_id}")
                return {'message': 'Khung giờ không tồn tại'}, 404

            data = request.get_json()
            thoi_gian_bat_dau = data.get('thoi_gian_bat_dau')
            thoi_gian_ket_thuc = data.get('thoi_gian_ket_thuc')
            so_nhan_vien_ranh = data.get('so_nhan_vien_ranh')

            if not thoi_gian_bat_dau or not thoi_gian_ket_thuc:
                logger.error("Thiếu thông tin bắt buộc: thoi_gian_bat_dau hoặc thoi_gian_ket_thuc")
                return {'message': 'Thời gian bắt đầu và thời gian kết thúc là bắt buộc'}, 400

            try:
                thoi_gian_bat_dau = datetime.strptime(thoi_gian_bat_dau, '%H:%M').time()
                thoi_gian_ket_thuc = datetime.strptime(thoi_gian_ket_thuc, '%H:%M').time()
            except ValueError:
                logger.error(f"Định dạng thời gian không hợp lệ: thoi_gian_bat_dau={thoi_gian_bat_dau}, thoi_gian_ket_thuc={thoi_gian_ket_thuc}")
                return {'message': 'Định dạng thời gian không hợp lệ (HH:MM)'}, 400

            if thoi_gian_bat_dau >= thoi_gian_ket_thuc:
                logger.error(f"Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc: thoi_gian_bat_dau={thoi_gian_bat_dau}, thoi_gian_ket_thuc={thoi_gian_ket_thuc}")
                return {'message': 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc'}, 400

            if so_nhan_vien_ranh is not None:
                try:
                    so_nhan_vien_ranh = int(so_nhan_vien_ranh)
                    if so_nhan_vien_ranh < 0:
                        logger.error(f"Số nhân viên rảnh không hợp lệ: so_nhan_vien_ranh={so_nhan_vien_ranh}")
                        return {'message': 'Số nhân viên rảnh phải là số không âm'}, 400
                    khung_gio.so_nhan_vien_ranh = so_nhan_vien_ranh
                except ValueError:
                    logger.error(f"Số nhân viên rảnh không hợp lệ: so_nhan_vien_ranh={so_nhan_vien_ranh}")
                    return {'message': 'Số nhân viên rảnh phải là một số nguyên'}, 400

            khung_gio.thoi_gian_bat_dau = thoi_gian_bat_dau
            khung_gio.thoi_gian_ket_thuc = thoi_gian_ket_thuc
            db.session.commit()

            logger.debug(f"Cập nhật khung giờ thành công: id={khung_gio_id}")
            return {'message': 'Cập nhật khung giờ thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi cập nhật khung giờ: {str(e)}")
            return {'message': f'Lỗi khi cập nhật khung giờ: {str(e)}'}, 500

    @jwt_required()
    def delete(self, khung_gio_id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if user.vai_tro != 'quan_tri':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ quản trị viên mới có thể truy cập API này'}, 403

            khung_gio = db.session.query(KhungGio).filter_by(id=khung_gio_id).first()
            if not khung_gio:
                logger.error(f"Khung giờ không tồn tại: id={khung_gio_id}")
                return {'message': 'Khung giờ không tồn tại'}, 404

            db.session.delete(khung_gio)
            db.session.commit()

            logger.debug(f"Xóa khung giờ thành công: id={khung_gio_id}")
            return {'message': 'Xóa khung giờ thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi xóa khung giờ: {str(e)}")
            return {'message': f'Lỗi khi xóa khung giờ: {str(e)}'}, 500