from sqlalchemy import Column, Integer, String, DateTime, Text
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)
from passlib.apps import custom_app_context as pwd_context
from flask import current_app as app
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import relationship
from .BaseModel import Base

engine = create_engine("sqlite:///capstone.db")
Session = sessionmaker(bind=engine)


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    username = Column(String)
    password = Column(String)
    photoPath = Column(String)
    selfDescription = Column(Text)
    lastViewDate = Column(DateTime)
    password_hash = Column(String(128))
    followers = Column(Integer, default=0)

    def hash_password(self, password):
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def generate_auth_token(self, expiration=3600 * 24):
        s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
        return s.dumps({'id': self.id})

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None
        except BadSignature:
            return None
        session = Session()
        user = session.query(User).filter_by(id=data['id']).first()
        session.close()
        return data['id']

    subscribeId = relationship('Subscribe', cascade="all, delete-orphan", foreign_keys='Subscribe.subscriberId')
    subscribeMan = relationship('Subscribe', cascade="all, delete-orphan", foreign_keys='Subscribe.subscribedMan')
    commentUser = relationship('Comment', cascade="all, delete-orphan")
    likeMan = relationship('Like', cascade="all, delete-orphan")
    recipe = relationship("Recipes", cascade="all, delete-orphan")
