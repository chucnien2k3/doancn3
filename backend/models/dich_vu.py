from database import db

class DichVu(db.Model):
    __tablename__ = 'dich_vu'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    ten_dich_vu = db.Column(db.String(100), nullable=False)
    mo_ta = db.Column(db.Text)
    thoi_gian_du_kien = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<DichVu {self.ten_dich_vu}>'