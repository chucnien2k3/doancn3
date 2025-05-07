from database import db

class ChiTietBaoDuong(db.Model):
    __tablename__ = 'chi_tiet_bao_duong'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    lich_hen_id = db.Column(db.Integer, db.ForeignKey('lich_hen.id'), nullable=False)
    phu_tung_da_dung = db.Column(db.Text)
    thoi_gian_thuc_te = db.Column(db.Integer)
    ghi_chu = db.Column(db.Text)
    bao_gia = db.Column(db.DECIMAL(10, 2))

    lich_hen = db.relationship('models.lich_hen.LichHen', backref='chi_tiet_bao_duong')

    def __repr__(self):
        return f'<ChiTietBaoDuong {self.id}>'