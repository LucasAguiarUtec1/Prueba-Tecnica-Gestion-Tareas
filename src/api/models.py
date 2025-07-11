from typing import List
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "User"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str]
    tasks: Mapped[List["Task"]] = relationship()

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
        }
    
class Task(db.Model):
    __tablename__ = "Task"

    id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[str]
    completed: Mapped[bool]
    user_id: Mapped[int] = mapped_column(ForeignKey("User.id"))
