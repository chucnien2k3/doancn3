from database import db

class PhanCongNhanVien(db.Model):
    __tablename__ = 'phan_cong_nhan_vien'
    __table_args__ = {'extend_existing': True}
    lich_hen_id = db.Column(db.Integer, db.ForeignKey('lich_hen.id'), primary_key=True)
    nhan_vien_id = db.Column(db.Integer, db.ForeignKey('nhan_vien.id'), primary_key=True)

    lich_hen = db.relationship('models.lich_hen.LichHen', backref='phan_cong')
    nhan_vien = db.relationship('models.nhan_vien.NhanVien', backref='phan_cong')

    def __repr__(self):
        return f'<PhanCongNhanVien lich_hen_id={self.lich_hen_id} nhan_vien_id={self.nhan_vien_id}>'