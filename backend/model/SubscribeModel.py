from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from datetime import datetime
from .BaseModel import Base


class Subscribe(Base):
    __tablename__ = "subscribe"
    id = Column(Integer, primary_key=True)
    subscriberId = Column(Integer, ForeignKey("user.id", ondelete='CASCADE'))
    subscribeType = Column(Enum('Recipe', 'Contributer'), nullable=False)
    subscribedRecipe = Column(Integer)
    subscribedMan = Column(Integer, ForeignKey("user.id", ondelete='CASCADE'))
    subDate = Column(DateTime, default=datetime.now())
