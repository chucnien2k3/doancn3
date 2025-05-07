from flask_restful import Resource, reqparse
from models.user import NguoiDung
from flask_jwt_extended import create_access_token
import logging

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

login_parser = reqparse.RequestParser()
login_parser.add_argument('email', type=str, required=True, help='Email không được để trống')
login_parser.add_argument('mat_khau', type=str, required=True, help='Mật khẩu không được để trống')

class Login(Resource):
    def post(self):
        try:
            args = login_parser.parse_args()
            email = args['email']
            mat_khau = args['mat_khau']

            logger.debug(f"Đăng nhập với email: {email}")

            user = NguoiDung.query.filter_by(email=email).first()
            if not user:
                logger.warning(f"Không tìm thấy người dùng với email: {email}")
                return {'message': 'Email hoặc mật khẩu không đúng'}, 401

            # So sánh mật khẩu trực tiếp (bỏ check_password_hash)
            if user.mat_khau != mat_khau:
                logger.warning(f"Mật khẩu không đúng cho email: {email}")
                return {'message': 'Email hoặc mật khẩu không đúng'}, 401

            # Kiểm tra vai_tro hợp lệ
            valid_roles = ['khach_hang', 'nhan_vien', 'quan_tri']
            if user.vai_tro not in valid_roles:
                logger.error(f"Vai trò không hợp lệ: {user.vai_tro} cho email: {email}")
                return {'message': 'Vai trò không hợp lệ'}, 403

            # Tạo access token
            additional_claims = {'vai_tro': user.vai_tro}
            access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
            logger.debug(f"Access token được tạo: {access_token}")

            return {
                'message': 'Đăng nhập thành công!',
                'access_token': access_token,
                'vai_tro': user.vai_tro,
                'email': user.email  # Thêm email vào response
            }, 200
        except Exception as e:
            logger.error(f"Lỗi khi đăng nhập: {str(e)}")
            return {'message': f'Lỗi khi đăng nhập: {str(e)}'}, 500