from flask_restful import Resource, reqparse
from models.user import NguoiDung
from database import db
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

register_parser = reqparse.RequestParser()
register_parser.add_argument('email', type=str, required=True, help='Email không được để trống')
register_parser.add_argument('so_dien_thoai', type=str, required=True, help='Số điện thoại không được để trống')
register_parser.add_argument('mat_khau', type=str, required=True, help='Mật khẩu không được để trống')
register_parser.add_argument('ho_va_ten', type=str, required=True, help='Họ và tên không được để trống')

class Register(Resource):
    def post(self):
        try:
            args = register_parser.parse_args()
            email = args['email']
            so_dien_thoai = args['so_dien_thoai']
            mat_khau = args['mat_khau']
            ho_va_ten = args['ho_va_ten']

            # Kiểm tra email đã tồn tại chưa
            if NguoiDung.query.filter_by(email=email).first():
                logger.error(f"Email đã tồn tại: {email}")
                return {'message': 'Email đã tồn tại'}, 400

            # Kiểm tra số điện thoại đã tồn tại chưa
            if NguoiDung.query.filter_by(so_dien_thoai=so_dien_thoai).first():
                logger.error(f"Số điện thoại đã tồn tại: {so_dien_thoai}")
                return {'message': 'Số điện thoại đã tồn tại'}, 400

            # Tạo người dùng mới với vai trò mặc định là khach_hang
            user = NguoiDung(
                email=email,
                so_dien_thoai=so_dien_thoai,
                mat_khau=mat_khau,
                vai_tro='khach_hang',
                ho_va_ten=ho_va_ten
            )
            db.session.add(user)
            db.session.commit()

            logger.debug(f"Đăng ký thành công cho email: {email}")
            return {'message': 'Đăng ký thành công!'}, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi đăng ký: {str(e)}")
            return {'message': f'Lỗi khi đăng ký: {str(e)}'}, 500