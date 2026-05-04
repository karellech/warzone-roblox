from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/api", tags=["leaderboard"])

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    players = db.query(models.Player)\
                .order_by(models.Player.total_kills.desc())\
                .limit(100).all()

    return [
        {
            "rank": i + 1,
            "username": p.username,
            "total_kills": p.total_kills,
            "total_deaths": p.total_deaths,
            "kd_ratio": round(p.total_kills / max(p.total_deaths, 1), 2),
            "grade": p.grade
        }
        for i, p in enumerate(players)
    ]