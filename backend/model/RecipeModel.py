from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .BaseModel import Base


class Recipes(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True)
    name = Column(String(256), nullable=False)
    method = Column(String(32), nullable=False)
    mealType = Column(String(32), nullable=False)
    ingredients = Column(Text, nullable=False)
    steps = Column(Text, nullable=False)
    contributorId = Column(Integer, ForeignKey("user.id", ondelete='CASCADE'))
    description = Column(String(256), nullable=True)
    photoPath = Column(String, nullable=True)
    createTime = Column(DateTime, default=datetime.now())
    likes = Column(Integer, default=0)
    isActive = Column(Boolean)

    def __repr__(self):
        return "<Recipes id='%r'>" % self.id

    likeRecipe = relationship('Like', cascade="all, delete-orphan")
