from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# ── Config commune ──────────────────────────────────────────────
# model_config permet à Pydantic de lire les objets SQLAlchemy directement
# (sans devoir les convertir en dict manuellement)
 
# ── Player ──────────────────────────────────────────────────────
class PlayerCreate(BaseModel):
    """Payload pour créer un joueur (envoyé par Roblox au premier login)."""
    roblox_user_id: int
    username: str
    
class PlayerResponse(BaseModel):
    """Ce que l'API retourne quand on demande un joueur."""
    model_config = ConfigDict(from_attributes=True)
 
    id: UUID
    roblox_user_id: int
    username: str
    total_kills: int
    total_deaths: int
    total_matches: int
    grade: str
    created_at: datetime
 
    @property
    def kd_ratio(self) -> float:
        if self.total_deaths == 0:
            return float(self.total_kills)
        return round(self.total_kills / self.total_deaths, 2)

# -- Match ---
class MatchCreate(BaseModel):
    """Payload pour créer une partie (envoyé par Roblox au début)."""
    player_count: int
    

class MatchEnd(BaseModel):
    winning_team: str
    duration_seconds: int
    
class MatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    id: UUID
    started_at: datetime
    ended_at: Optional[datetime]
    duration_seconds: Optional[int]
    winning_team: Optional[str]
    status: str

# -- Kill --
class KillRecord(BaseModel):
    """Un kill individuel dans le batch."""
    killer_roblox_id: int
    victim_roblox_id: int
    weapon: str                 # "ClassicSword" | "RayGun"
    killer_team: str            # "Red" | "Blue"
    timestamp_offset: int       # secondes depuis le début de la partie
 
class KillsBatch(BaseModel):
    """Batch de kills envoyé en fin de partie."""
    kills: list[KillRecord]
 
class KillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    id: UUID
    match_id: UUID
    killer_id: UUID
    victim_id: UUID
    weapon: str
    killed_at: datetime
 
# ── Leaderboard ──
class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    rank: int
    username: str
    roblox_user_id: int
    total_kills: int
    total_deaths: int
    total_matches: int
    grade: str
    kd_ratio: float
 
# ── Grade ──
class GradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
 
    id: UUID
    name: str
    label: str
    min_kills_required: int
    badge_color: str