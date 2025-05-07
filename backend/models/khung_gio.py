from database import db

class KhungGio(db.Model):
    __tablename__ = 'khung_gio'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    thoi_gian_bat_dau = db.Column(db.Time, nullable=False)
    thoi_gian_ket_thuc = db.Column(db.Time, nullable=False)
    so_nhan_vien_ranh = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<KhungGio {self.id}>'