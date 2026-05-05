from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime,timezone
from uuid import UUID
from app.database import get_db
from app.dependencies import verify_roblox_key
from app import models, schemas
from routers.players import compute_grade

router = APIRouter(prefix="/api/matches", tags=["matches"])

@router.post("/", response_model=schemas.MatchResponse, status_code=201)
def create_match(payload: schemas.MatchCreate, db: Session = Depends(get_db)):
    """
    Crée une nouvelle partie en base. Appelé par Roblox au début du combat.
    Retourne l'UUID de la partie — Roblox le stocke pour l'envoyer avec les kills.
    """
    match = models.Match(status="ongoing")
    db.add(match)
    db.commit()
    db.refresh(match)
    return match

@router.post("/{match_id}/kills", status_code=201)
def add_kills_batch(match_id: UUID, payload: schemas.KillsBatch, db: Session = Depends(get_db)):
    """
    Reçoit tous les kills d'une partie en un seul appel (batching).
    Pour chaque kill :
      1. Retrouve killer et victim par leur roblox_user_id
      2. Insère une ligne dans la table kills
      3. Met à jour total_kills / total_deaths / grade des deux joueurs
    """
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partie introuvable")
    if match.status == "finished":
        raise HTTPException(status_code=400, detail="La partie est déjà terminée")
 
    for record in payload.kills:
        killer = db.query(models.Player).filter(
            models.Player.roblox_user_id == record.killer_roblox_id
        ).first()
        victim = db.query(models.Player).filter(
            models.Player.roblox_user_id == record.victim_roblox_id
        ).first()
 
        # On ignore les kills avec des joueurs inconnus (sécurité)
        if not killer or not victim:
            continue
 
        # Créer la ligne kill
        kill = models.Kill(
            match_id=match_id,
            killer_id=killer.id,
            victim_id=victim.id,
            weapon=record.weapon,
        )
        db.add(kill)
 
        # Mettre à jour les compteurs
        killer.total_kills += 1
        victim.total_deaths += 1
 
        # Recalculer les grades
        killer.grade = compute_grade(killer.total_kills, killer.total_deaths)
        victim.grade  = compute_grade(victim.total_kills, victim.total_deaths)
 
    db.commit()
    return {"inserted": len(payload.kills)}
 
 
@router.post("/{match_id}/end", response_model=schemas.MatchResponse)
def end_match(match_id: UUID, payload: schemas.MatchEnd, db: Session = Depends(get_db)):
    """
    Termine une partie : enregistre l'équipe gagnante, la durée,
    et incrémente total_matches pour tous les joueurs participants.
    """
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partie introuvable")
 
    match.ended_at         = datetime.now(timezone.utc)
    match.duration_seconds = payload.duration_seconds
    match.winning_team     = payload.winning_team
    match.status           = "finished"
 
    # Incrémenter total_matches pour chaque joueur lié à cette partie
    match_players = db.query(models.MatchPlayer).filter(
        models.MatchPlayer.match_id == match_id
    ).all()
    for mp in match_players:
        player = db.query(models.Player).filter(models.Player.id == mp.player_id).first()
        if player:
            player.total_matches += 1
 
    db.commit()
    db.refresh(match)
    return match
 
 
@router.get("/", response_model=list[schemas.MatchResponse])
def list_matches(limit: int = 20, db: Session = Depends(get_db)):
    """Retourne les N dernières parties (terminées ou en cours)."""
    return (
        db.query(models.Match)
        .order_by(models.Match.started_at.desc())
        .limit(limit)
        .all()
    )
 
 
@router.get("/{match_id}", response_model=schemas.MatchResponse)
def get_match(match_id: UUID, db: Session = Depends(get_db)):
    """Retourne le détail d'une partie."""
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partie introuvable")
    return match