from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])


@router.get("/", response_model=list[schemas.LeaderboardEntry])
def get_leaderboard(limit: int = 50, db: Session = Depends(get_db)):
    """
    Retourne le classement global des joueurs, triés par kills décroissants.
    Le rang est calculé ici (row_number côté Python, pas en SQL pour rester simple).
    """
    players = (
        db.query(models.Player)
        .order_by(models.Player.total_kills.desc())
        .limit(limit)
        .all()
    )

    result = []
    for rank, player in enumerate(players, start=1):
        kd = (
            round(player.total_kills / player.total_deaths, 2)
            if player.total_deaths > 0
            else float(player.total_kills)
        )
        result.append(schemas.LeaderboardEntry(
            rank=rank,
            username=player.username,
            roblox_user_id=player.roblox_user_id,
            total_kills=player.total_kills,
            total_deaths=player.total_deaths,
            total_matches=player.total_matches,
            grade=player.grade,
            kd_ratio=kd,
        ))

    return result