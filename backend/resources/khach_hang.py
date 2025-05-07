from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database import db
from models.lich_hen import LichHen, Gara
from models.dich_vu import DichVu
from models.khung_gio import KhungGio
from models.thong_bao import ThongBao
from datetime import datetime
from models.user import NguoiDung
import logging

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Parser cho đặt lịch và chỉnh sửa lịch hẹn
lich_hen_parser = reqparse.RequestParser()
lich_hen_parser.add_argument('dich_vu_id', type=int, required=True, help='Dịch vụ không được để trống')
lich_hen_parser.add_argument('khung_gio_id', type=int, required=True, help='Khung giờ không được để trống')
lich_hen_parser.add_argument('gara_id', type=int, required=True, help='Gara không được để trống')
lich_hen_parser.add_argument('ngay_hen', type=str, required=True, help='Ngày hẹn không được để trống')

class GaraList(Resource):
    def get(self):
        try:
            garas = Gara.query.filter_by(trang_thai='hoat_dong').all()
            result = [
                {
                    'id': gara.id,
                    'ten_gara': gara.ten_gara,
                    'dia_chi': gara.dia_chi,
                    'so_dien_thoai': gara.so_dien_thoai
                }
                for gara in garas
            ]
            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách gara: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách gara: {str(e)}'}, 500

class LichHenList(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
            logger.debug(f"User ID: {user_id}, Claims: {claims}")

            if claims.get('vai_tro') != 'khach_hang':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={claims.get('vai_tro')}")
                return {'message': 'Chỉ khách hàng mới có thể truy cập API này'}, 403

            lich_hens = (
                db.session.query(LichHen, DichVu, KhungGio, Gara)
                .join(DichVu, LichHen.dich_vu_id == DichVu.id)
                .join(KhungGio, LichHen.khung_gio_id == KhungGio.id)
                .outerjoin(Gara, LichHen.gara_id == Gara.id)
                .filter(LichHen.nguoi_dung_id == user_id)
                .all()
            )

            result = [
                {
                    'id': lh.id,
                    'dich_vu_id': lh.dich_vu_id,
                    'ten_dich_vu': dv.ten_dich_vu,
                    'khung_gio_id': lh.khung_gio_id,
                    'thoi_gian_bat_dau': kg.thoi_gian_bat_dau.strftime('%H:%M:%S') if kg.thoi_gian_bat_dau else None,
                    'thoi_gian_ket_thuc': kg.thoi_gian_ket_thuc.strftime('%H:%M:%S') if kg.thoi_gian_ket_thuc else None,
                    'gara_id': lh.gara_id,
                    'ten_gara': gara.ten_gara if gara else None,
                    'dia_chi_gara': gara.dia_chi if gara else None,
                    'ngay_hen': lh.ngay_hen.isoformat() if lh.ngay_hen else None,
                    'trang_thai': lh.trang_thai,
                    'thoi_gian_tao': lh.thoi_gian_tao.isoformat() if lh.thoi_gian_tao else None
                }
                for lh, dv, kg, gara in lich_hens
            ]

            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách lịch hẹn: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách lịch hẹn: {str(e)}'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
            logger.debug(f"User ID: {user_id}, Claims: {claims}")

            if claims.get('vai_tro') != 'khach_hang':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={claims.get('vai_tro')}")
                return {'message': 'Chỉ khách hàng mới có thể truy cập API này'}, 403

            args = lich_hen_parser.parse_args()
            logger.debug(f"Arguments: {args}")

            gara = Gara.query.get(args['gara_id'])
            if not gara:
                return {'message': 'Gara không tồn tại.'}, 400
            if gara.trang_thai != 'hoat_dong':
                return {'message': 'Gara hiện không hoạt động.'}, 400

            khung_gio = KhungGio.query.get(args['khung_gio_id'])
            if not khung_gio:
                return {'message': 'Khung giờ không tồn tại.'}, 400
            if khung_gio.so_nhan_vien_ranh <= 0:
                return {'message': 'Khung giờ không còn nhân viên rảnh.'}, 400

            try:
                ngay_hen = datetime.strptime(args['ngay_hen'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Định dạng ngày hẹn không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.'}, 400

            lich_hen = LichHen(
                nguoi_dung_id=user_id,
                dich_vu_id=args['dich_vu_id'],
                khung_gio_id=args['khung_gio_id'],
                gara_id=args['gara_id'],
                ngay_hen=ngay_hen,
                trang_thai='dang_cho'
            )
            db.session.add(lich_hen)

            khung_gio.so_nhan_vien_ranh -= 1
            db.session.commit()

            return {'message': 'Đặt lịch thành công!'}, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi đặt lịch: {str(e)}")
            return {'message': f'Lỗi khi đặt lịch: {str(e)}'}, 500

class LichHenDetail(Resource):
    @jwt_required()
    def put(self, id):
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
            logger.debug(f"User ID: {user_id}, Claims: {claims}")

            if claims.get('vai_tro') != 'khach_hang':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={claims.get('vai_tro')}")
                return {'message': 'Chỉ khách hàng mới có thể truy cập API này'}, 403

            lich_hen = LichHen.query.filter_by(id=id, nguoi_dung_id=user_id).first()
            if not lich_hen:
                return {'message': 'Lịch hẹn không tồn tại.'}, 404

            if lich_hen.trang_thai not in ['dang_cho', 'da_xac_nhan']:
                return {'message': 'Không thể chỉnh sửa lịch hẹn này.'}, 400

            args = lich_hen_parser.parse_args()
            logger.debug(f"Arguments: {args}")

            dich_vu = DichVu.query.get(args['dich_vu_id'])
            if not dich_vu:
                return {'message': 'Dịch vụ không tồn tại.'}, 400

            gara = Gara.query.get(args['gara_id'])
            if not gara:
                return {'message': 'Gara không tồn tại.'}, 400
            if gara.trang_thai != 'hoat_dong':
                return {'message': 'Gara hiện không hoạt động.'}, 400

            khung_gio_moi = KhungGio.query.get(args['khung_gio_id'])
            if not khung_gio_moi:
                return {'message': 'Khung giờ không tồn tại.'}, 400
            if khung_gio_moi.so_nhan_vien_ranh <= 0 and args['khung_gio_id'] != lich_hen.khung_gio_id:
                return {'message': 'Khung giờ mới không còn nhân viên rảnh.'}, 400

            try:
                ngay_hen = datetime.strptime(args['ngay_hen'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Định dạng ngày hẹn không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.'}, 400

            if args['khung_gio_id'] != lich_hen.khung_gio_id:
                khung_gio_cu = KhungGio.query.get(lich_hen.khung_gio_id)
                if khung_gio_cu:
                    khung_gio_cu.so_nhan_vien_ranh += 1
                khung_gio_moi.so_nhan_vien_ranh -= 1

            lich_hen.dich_vu_id = args['dich_vu_id']
            lich_hen.khung_gio_id = args['khung_gio_id']
            lich_hen.gara_id = args['gara_id']
            lich_hen.ngay_hen = ngay_hen
            db.session.commit()

            return {'message': 'Chỉnh sửa lịch hẹn thành công!'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi chỉnh sửa lịch hẹn: {str(e)}")
            return {'message': f'Lỗi khi chỉnh sửa lịch hẹn: {str(e)}'}, 500

    @jwt_required()
    def delete(self, id):
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
            logger.debug(f"User ID: {user_id}, Claims: {claims}")

            if claims.get('vai_tro') != 'khach_hang':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={claims.get('vai_tro')}")
                return {'message': 'Chỉ khách hàng mới có thể truy cập API này'}, 403

            lich_hen = LichHen.query.filter_by(id=id, nguoi_dung_id=user_id).first()
            if not lich_hen:
                return {'message': 'Lịch hẹn không tồn tại.'}, 404

            if lich_hen.trang_thai not in ['dang_cho', 'da_xac_nhan']:
                return {'message': 'Không thể hủy lịch hẹn này.'}, 400

            khung_gio = KhungGio.query.get(lich_hen.khung_gio_id)
            if khung_gio:
                khung_gio.so_nhan_vien_ranh += 1

            lich_hen.trang_thai = 'da_huy'
            db.session.commit()

            return {'message': 'Hủy lịch hẹn thành công!'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi hủy lịch hẹn: {str(e)}")
            return {'message': f'Lỗi khi hủy lịch hẹn: {str(e)}'}, 500

class ThongBaoList(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
            logger.debug(f"User ID: {user_id}, Claims: {claims}")

            if claims.get('vai_tro') != 'khach_hang':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={claims.get('vai_tro')}")
                return {'message': 'Chỉ khách hàng mới có thể truy cập API này'}, 403

            thong_baos = ThongBao.query.filter_by(nguoi_dung_id=user_id).all()
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

class DichVuList(Resource):
    def get(self):
        try:
            dich_vus = DichVu.query.all()
            result = [
                {
                    'id': dv.id,
                    'ten_dich_vu': dv.ten_dich_vu,
                    'mo_ta': dv.mo_ta,
                    'thoi_gian_du_kien': dv.thoi_gian_du_kien
                }
                for dv in dich_vus
            ]

            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách dịch vụ: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách dịch vụ: {str(e)}'}, 500

class KhungGioList(Resource):
    def get(self):
        try:
            khung_gios = KhungGio.query.all()
            result = [
                {
                    'id': kg.id,
                    'thoi_gian_bat_dau': kg.thoi_gian_bat_dau.strftime('%H:%M:%S') if kg.thoi_gian_bat_dau else None,
                    'thoi_gian_ket_thuc': kg.thoi_gian_ket_thuc.strftime('%H:%M:%S') if kg.thoi_gian_ket_thuc else None,
                    'so_nhan_vien_ranh': kg.so_nhan_vien_ranh
                }
                for kg in khung_gios
            ]

            return result if result else [], 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách khung giờ: {str(e)}")
            return {'message': f'Lỗi khi lấy danh sách khung giờ: {str(e)}'}, 500

class BaoCaoLichHen(Resource):
    @jwt_required()
    def get(self, id):
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
            logger.debug(f"User ID: {user_id}, Claims: {claims}")

            if claims.get('vai_tro') != 'khach_hang':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={claims.get('vai_tro')}")
                return {'message': 'Chỉ khách hàng mới có thể truy cập API này'}, 403

            lich_hen = LichHen.query.filter_by(id=id, nguoi_dung_id=user_id).first()
            if not lich_hen:
                return {'message': 'Lịch hẹn không tồn tại.'}, 404

            if lich_hen.trang_thai != 'da_hoan_thanh':
                return {'message': 'Lịch hẹn chưa hoàn thành.'}, 400

            return {
                'lich_hen_id': lich_hen.id,
                'dich_vu_id': lich_hen.dich_vu_id,
                'trang_thai': lich_hen.trang_thai
            }, 200
        except Exception as e:
            logger.error(f"Lỗi khi tải báo cáo: {str(e)}")
            return {'message': f'Lỗi khi tải báo cáo: {str(e)}'}, 500
        
class ThongTinKhachHang(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()
            if not user:
                logger.error(f"Người dùng không tồn tại: user_id={user_id}")
                return {'message': 'Người dùng không tồn tại'}, 404

            if user.vai_tro != 'khach_hang':
                logger.error(f"Truy cập trái phép: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Chỉ khách hàng mới có thể truy cập API này'}, 403

            logger.debug(f"Lấy thông tin khách hàng thành công: user_id={user_id}")
            return {
                'email': user.email,
                'ho_va_ten': user.ho_va_ten,
                'vai_tro': user.vai_tro
            }, 200
        except Exception as e:
            logger.error(f"Lỗi khi lấy thông tin khách hàng: {str(e)}")
            return {'message': f'Lỗi khi lấy thông tin khách hàng: {str(e)}'}, 500