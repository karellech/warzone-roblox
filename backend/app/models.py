import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, BigInteger,
    DateTime, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Player(Base):
    __tablename__ = "players"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    roblox_user_id = Column(BigInteger, unique=True, nullable=False)
    username       = Column(String, nullable=False)
    total_kills    = Column(Integer, default=0)
    total_deaths   = Column(Integer, default=0)
    total_matches  = Column(Integer, default=0)
    grade          = Column(String, default="Recrue")
    created_at     = Column(DateTime, default=datetime.utcnow)


class Match(Base):
    __tablename__ = "matches"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    started_at       = Column(DateTime, default=datetime.utcnow)
    ended_at         = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    winning_team     = Column(String, nullable=True)
    status           = Column(String, default="ongoing")
    kills            = relationship("Kill", back_populates="match")


class Kill(Base):
    __tablename__ = "kills"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    match_id  = Column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    killer_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    victim_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    weapon    = Column(String, nullable=False)
    killed_at = Column(DateTime, default=datetime.utcnow)
    match     = relationship("Match", back_populates="kills")

class MatchPlayer(Base):
    __tablename__ = "matches_players"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    match_id  = Column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    team      = Column(String, nullable=False)
    kills     = Column(Integer, default=0)
    deaths    = Column(Integer, default=0)


class Grade(Base):
    __tablename__ = "grades"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name               = Column(String, unique=True, nullable=False)
    label              = Column(String, nullable=False)
    min_kills_required = Column(Integer, nullable=False)
    badge_color        = Column(String, nullable=False)    