from database import db
from datetime import datetime

class ThongBao(db.Model):
    __tablename__ = 'thong_bao'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False)
    loai_thong_bao = db.Column(db.Enum('sms', 'email'), nullable=False)
    noi_dung = db.Column(db.Text)
    trang_thai = db.Column(db.Enum('da_gui', 'that_bai'), default='da_gui')
    thoi_gian_gui = db.Column(db.DateTime, default=datetime.utcnow)

    nguoi_dung = db.relationship('models.user.NguoiDung', backref='thong_bao')

    def __repr__(self):
        return f'<ThongBao {self.id}>'