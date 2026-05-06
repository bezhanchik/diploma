from datetime import datetime
from typing import Optional
from sqlalchemy import BigInteger, DateTime, Text, func, ForeignKey, Enum, Integer, Column, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import enum


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    first_name: Mapped[str | None] = mapped_column(Text)
    last_name: Mapped[str | None] = mapped_column(Text)
    role: Mapped[str] = mapped_column(Text, server_default="user", nullable=False)  # "user" или "admin"
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    organization_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("organizations.id"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    teams = relationship("Team", back_populates="event")

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(Text, nullable=False)
    domain: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
    )




class Challenge(Base):
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    # Убрать difficulty, points, company, created_at если их нет в БД
    # difficulty = Column(Enum(DifficultyEnum), nullable=False)  # ЗАКОММЕНТИРОВАТЬ
    # points = Column(Integer, default=0)  # ЗАКОММЕНТИРОВАТЬ
    # company = Column(String(100))  # ЗАКОММЕНТИРОВАТЬ
    # created_at = Column(DateTime, server_default=func.now())  # ЗАКОММЕНТИРОВАТЬ
    
    track = relationship("Track", back_populates="challenges")

class Track(Base):
    __tablename__ = "tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))  # Добавить если есть
    name = Column(String(100), nullable=False)
    
    challenges = relationship("Challenge", back_populates="track")




class Team(Base):
    __tablename__ = "teams"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    event_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("events.id"))
    track_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("tracks.id"))
    captain_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Связи
    event = relationship("Event", back_populates="teams")
    track = relationship("Track")
    captain = relationship("User", foreign_keys=[captain_id])
    members = relationship("TeamMember", back_populates="team")

class TeamMember(Base):
    __tablename__ = "team_members"

    team_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("teams.id"), primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), primary_key=True)
    role: Mapped[Optional[str]] = mapped_column(Text)
    
    # Связи
    team = relationship("Team", back_populates="members")
    user = relationship("User")