from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app.database import get_db
from app.dependencies import verify_roblox_key
from app import models, schemas

router = APIRouter(prefix="/api/matches", tags=["matches"])

GRADES = [
    (200, "Général"), (100, "Colonel"), (60, "Lieutenant"),
    (30, "Sergent"),  (10, "Caporal"),  (0,  "Recrue"),
]

def compute_grade(kills: int) -> str:
    for seuil, grade in GRADES:
        if kills >= seuil:
            return grade
    return "Recrue"


@router.post("", status_code=201, dependencies=[Depends(verify_roblox_key)])
def create_match(db: Session = Depends(get_db)):
    match = models.Match()
    db.add(match)
    db.commit()
    db.refresh(match)
    return {"match_id": str(match.id), "started_at": match.started_at}


@router.post("/{match_id}/kills", dependencies=[Depends(verify_roblox_key)])
def add_kills(match_id: str, kills: List[schemas.KillIn], db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partie introuvable")

    for k in kills:
        # Upsert killer
        killer = db.query(models.Player).filter(
            models.Player.roblox_user_id == k.killer_roblox_id
        ).first()
        if not killer:
            killer = models.Player(
                roblox_user_id=k.killer_roblox_id,
                username=f"Player_{k.killer_roblox_id}"
            )
            db.add(killer)
            db.flush()

        # Upsert victim
        victim = db.query(models.Player).filter(
            models.Player.roblox_user_id == k.victim_roblox_id
        ).first()
        if not victim:
            victim = models.Player(
                roblox_user_id=k.victim_roblox_id,
                username=f"Player_{k.victim_roblox_id}"
            )
            db.add(victim)
            db.flush()

        # Insert kill
        db.add(models.Kill(
            match_id=match.id,
            killer_id=killer.id,
            victim_id=victim.id,
            weapon=k.weapon,
            killed_at=k.killed_at or datetime.utcnow()
        ))

        # Mise à jour stats
        killer.total_kills += 1
        killer.grade = compute_grade(killer.total_kills)
        victim.total_deaths += 1

    db.commit()
    return {"inserted": len(kills)}


@router.post("/{match_id}/end", dependencies=[Depends(verify_roblox_key)])
def end_match(match_id: str, data: schemas.MatchEndIn, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partie introuvable")
    if match.status == "ended":
        raise HTTPException(status_code=409, detail="Partie déjà terminée")

    match.ended_at = datetime.utcnow()
    match.status = "ended"
    match.winning_team = data.winning_team
    match.duration_seconds = data.duration_seconds
    db.commit()
    return {"status": "ended", "winning_team": data.winning_team}