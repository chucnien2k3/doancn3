from database import db
from datetime import datetime

class Gara(db.Model):
    __tablename__ = 'gara'
    id = db.Column(db.Integer, primary_key=True)
    ten_gara = db.Column(db.String(100), nullable=False)
    dia_chi = db.Column(db.Text, nullable=False)
    so_dien_thoai = db.Column(db.String(20))
    trang_thai = db.Column(db.Enum('hoat_dong', 'tam_ngung'), default='hoat_dong')

    def __repr__(self):
        return f'<Gara {self.ten_gara}>'

class LichHen(db.Model):
    __tablename__ = 'lich_hen'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False)
    dich_vu_id = db.Column(db.Integer, db.ForeignKey('dich_vu.id'), nullable=False)
    khung_gio_id = db.Column(db.Integer, db.ForeignKey('khung_gio.id'), nullable=False)
    gara_id = db.Column(db.Integer, db.ForeignKey('gara.id'), nullable=True)
    do_uu_tien = db.Column(db.Integer, default=0)
    trang_thai = db.Column(db.Enum('dang_cho', 'da_xac_nhan', 'da_hoan_thanh', 'da_huy'), default='dang_cho')
    thoi_gian_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_hen = db.Column(db.Date, nullable=False)

    nguoi_dung = db.relationship('models.user.NguoiDung', backref='lich_hen')
    dich_vu = db.relationship('models.dich_vu.DichVu', backref='lich_hen')
    khung_gio = db.relationship('models.khung_gio.KhungGio', backref='lich_hen')
    gara = db.relationship('models.gara.Gara', backref='lich_hens')

    def __repr__(self):
        return f'<LichHen {self.id}>'