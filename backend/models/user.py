from database import db
from datetime import datetime

class NguoiDung(db.Model):
    __tablename__ = 'nguoi_dung'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    so_dien_thoai = db.Column(db.String(20), unique=True, nullable=False)
    mat_khau = db.Column(db.String(255), nullable=False)
    vai_tro = db.Column(db.Enum('khach_hang', 'nhan_vien', 'quan_tri'), default='khach_hang')
    ho_va_ten = db.Column(db.String(255), nullable=False)  # Thêm trường ho_va_ten
    thoi_gian_tao = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<NguoiDung {self.email}>'