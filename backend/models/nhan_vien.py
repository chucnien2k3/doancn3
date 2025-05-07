from database import db

class NhanVien(db.Model):
    __tablename__ = 'nhan_vien'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False)
    ho_va_ten = db.Column(db.String(100), nullable=False)
    ky_nang = db.Column(db.Text)
    lich_lam_viec = db.Column(db.JSON)

    user = db.relationship('models.user.NguoiDung', backref='nhan_vien')

    def __repr__(self):
        return f'<NhanVien {self.ho_va_ten}>'