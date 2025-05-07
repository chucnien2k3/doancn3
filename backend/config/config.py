from datetime import timedelta

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://root:chucnien2k3@localhost/dich_vu_oto'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'sachisusa-secret-key'
    JWT_SECRET_KEY = 'sachisusa-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # Tăng thời gian sống của token lên 1 giờ