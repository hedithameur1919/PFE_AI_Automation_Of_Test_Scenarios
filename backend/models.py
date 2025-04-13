from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from database import Base
import enum

# Role enum
class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = 'user'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), nullable=False, default="user")

    # Relationships
    requirements = relationship("Requirement", back_populates="user")
    ratings = relationship("Rating", back_populates="user")

class Requirement(Base):
    __tablename__ = 'requirement'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    requirement_text: Mapped[str] = mapped_column(String(1000), nullable=False)

    user = relationship("User", back_populates="requirements")
    scenarios = relationship("TestScenario", back_populates="requirement")

class TestScenario(Base):
    __tablename__ = 'test_scenario'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    requirement_id: Mapped[int] = mapped_column(ForeignKey("requirement.id"), nullable=False)
    scenario_text: Mapped[str] = mapped_column(String(3000), nullable=False)

    requirement = relationship("Requirement", back_populates="scenarios")
    rating = relationship("Rating", back_populates="scenario", uselist=False)  # One-to-one

class Rating(Base):
    __tablename__ = 'rating'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    scenario_id: Mapped[int] = mapped_column(ForeignKey("test_scenario.id"), unique=True, nullable=False)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)

    user = relationship("User", back_populates="ratings")
    scenario = relationship("TestScenario", back_populates="rating")
