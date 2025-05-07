from database import db

class Gara(db.Model):
    __tablename__ = 'gara'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    ten_gara = db.Column(db.String(100), nullable=False)
    dia_chi = db.Column(db.String(200), nullable=False)
    so_dien_thoai = db.Column(db.String(15))
    trang_thai = db.Column(db.String(20), nullable=False, default='hoat_dong')  # 'hoat_dong' hoặc 'tam_ngung'
    # Bỏ cột thoi_gian_tao