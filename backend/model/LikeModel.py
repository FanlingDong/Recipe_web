from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from datetime import datetime
from .BaseModel import Base


class Like(Base):
    __tablename__ = "like"
    id = Column(Integer, primary_key=True)
    likeMan = Column(Integer, ForeignKey("user.id", ondelete='CASCADE'))
    likeType = Column(Enum('Recipe', 'Comment'), nullable=False)
    likeRecipe = Column(Integer, ForeignKey("recipes.id", ondelete='CASCADE'))
    likeComment = Column(Integer, ForeignKey("comment.id", ondelete='CASCADE'))
    likeDate = Column(DateTime, default=datetime.now())
