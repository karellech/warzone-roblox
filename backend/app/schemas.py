from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class KillIn(BaseModel):
    killer_roblox_id: int
    victim_roblox_id: int
    weapon: str
    killed_at: Optional[datetime] = None

class MatchEndIn(BaseModel):
    winning_team: str
    duration_seconds: int

class PlayerOut(BaseModel):
    username: str
    total_kills: int
    total_deaths: int
    total_matches: int
    grade: str
    kd_ratio: float
    model_config = {"from_attributes": True}

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    total_kills: int
    total_deaths: int
    kd_ratio: float
    grade: str