from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/players", tags=["players"])

@router.get("/{roblox_id}/stats")
def get_player_stats(roblox_id: int, db: Session = Depends(get_db)):
    player = db.query(models.Player).filter(
        models.Player.roblox_user_id == roblox_id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Joueur introuvable")

    return {
        "username": player.username,
        "total_kills": player.total_kills,
        "total_deaths": player.total_deaths,
        "total_matches": player.total_matches,
        "grade": player.grade,
        "kd_ratio": round(player.total_kills / max(player.total_deaths, 1), 2)
    }