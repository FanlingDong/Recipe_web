from sqlalchemy import Column, Integer, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .BaseModel import Base


class Comment(Base):
    __tablename__ = "comment"
    id = Column(Integer, primary_key=True)
    commentUser = Column(Integer, ForeignKey("user.id", ondelete='CASCADE'))
    isReply = Column(Boolean, nullable=False)
    content = Column(Text)
    likes = Column(Integer, nullable=False)
    repliedComment = Column(Integer, ForeignKey("comment.id", ondelete='CASCADE'))
    repliedRecipe = Column(Integer, ForeignKey("recipes.id", ondelete='CASCADE'))
    commentDate = Column(DateTime, default=datetime.now())
    likeComment = relationship('Like', cascade="all, delete-orphan")
