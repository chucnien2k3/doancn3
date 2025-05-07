from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.lich_hen import LichHen
from models.user import NguoiDung
from database import db
import logging

logger = logging.getLogger(__name__)

class LichHenResource(Resource):
    @jwt_required()
    def put(self, id):
        try:
            user_id = get_jwt_identity()
            user = db.session.query(NguoiDung).filter_by(id=user_id).first()

            lich_hen = db.session.query(LichHen).filter_by(id=id).first()
            if not lich_hen:
                logger.error(f"Lịch hẹn không tồn tại: lich_hen_id={id}")
                return {'message': 'Lịch hẹn không tồn tại'}, 404

            data = request.get_json()
            trang_thai = data.get('trang_thai')

            # Kiểm tra vai trò và trạng thái hợp lệ
            if user.vai_tro == 'khach_hang':
                if lich_hen.nguoi_dung_id != user_id:
                    logger.error(f"Khách hàng không có quyền hủy lịch hẹn: user_id={user_id}, lich_hen_id={id}")
                    return {'message': 'Bạn không có quyền hủy lịch hẹn này'}, 403
                if trang_thai != 'da_huy':
                    logger.error(f"Khách hàng chỉ có thể hủy lịch hẹn: user_id={user_id}, trang_thai={trang_thai}")
                    return {'message': 'Khách hàng chỉ có thể hủy lịch hẹn'}, 400
                if lich_hen.trang_thai in ['da_xac_nhan', 'da_hoan_thanh']:
                    logger.error(f"Lịch hẹn không thể hủy do đã được xác nhận: lich_hen_id={id}")
                    return {'message': 'Lịch hẹn không thể hủy vì đã được xác nhận hoặc hoàn thành'}, 400
            elif user.vai_tro == 'nhan_vien':
                if trang_thai not in ['da_xac_nhan', 'da_hoan_thanh']:
                    logger.error(f"Nhân viên chỉ có thể xác nhận hoặc hoàn thành lịch hẹn: trang_thai={trang_thai}")
                    return {'message': 'Nhân viên chỉ có thể xác nhận hoặc hoàn thành lịch hẹn'}, 400
            else:
                logger.error(f"Vai trò không hợp lệ: user_id={user_id}, vai_tro={user.vai_tro}")
                return {'message': 'Vai trò không hợp lệ'}, 403

            lich_hen.trang_thai = trang_thai
            db.session.commit()

            logger.debug(f"Cập nhật trạng thái lịch hẹn thành công: lich_hen_id={id}, trang_thai={trang_thai}")
            return {'message': 'Cập nhật trạng thái lịch hẹn thành công'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi cập nhật trạng thái lịch hẹn: {str(e)}")
            return {'message': f'Lỗi khi cập nhật trạng thái lịch hẹn: {str(e)}'}, 500