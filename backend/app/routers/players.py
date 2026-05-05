from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/players", tags=["Players"])

def compute_grade(total_kills: int, total_deaths: int) -> str:
    """Calcule le grade selon le nombre de kills et le ratio K/D."""
    kd = total_kills / total_deaths if total_deaths > 0 else float(total_kills)
    if total_kills >= 500 and kd >= 2.0:
        return "Général"
    if total_kills >= 200 and kd >= 1.5:
        return "Lieutenant"
    if total_kills >= 50 and kd >= 1.0:
        return "Sergent"
    if total_kills >= 10 and kd >= 0.5:
        return "Soldat"
    return "Recrue"


@router.post("/", response_model=schemas.PlayerResponse, status_code=201)
def create_or_update_player(payload: schemas.PlayerCreate, db: Session = Depends(get_db)):
    """
    Crée un joueur s'il n'existe pas, ou met à jour son username s'il existe déjà.
    Appelé par Roblox à chaque fois qu'un joueur rejoint un serveur.
    """
    player = db.query(models.Player).filter(
        models.Player.roblox_user_id == payload.roblox_user_id
    ).first()

    if player:
        # Mise à jour du username si changé sur Roblox
        player.username = payload.username
    else:
        player = models.Player(
            roblox_user_id=payload.roblox_user_id,
            username=payload.username,
        )
        db.add(player)

    db.commit()
    db.refresh(player)
    return player


@router.get("/{roblox_user_id}", response_model=schemas.PlayerResponse)
def get_player(roblox_user_id: int, db: Session = Depends(get_db)):
    """Retourne le profil complet d'un joueur par son ID Roblox."""
    player = db.query(models.Player).filter(
        models.Player.roblox_user_id == roblox_user_id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Joueur introuvable")
    return player


@router.get("/{roblox_user_id}/matches", response_model=list[schemas.MatchResponse])
def get_player_matches(roblox_user_id: int, db: Session = Depends(get_db)):
    """Retourne les 20 dernières parties d'un joueur."""
    player = db.query(models.Player).filter(
        models.Player.roblox_user_id == roblox_user_id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Joueur introuvable")

    # Récupère les parties via la table de liaison matches_players
    match_players = (
        db.query(models.MatchPlayer)
        .filter(models.MatchPlayer.player_id == player.id)
        .order_by(models.MatchPlayer.id.desc())
        .limit(20)
        .all()
    )
    match_ids = [mp.match_id for mp in match_players]
    matches = db.query(models.Match).filter(models.Match.id.in_(match_ids)).all()
    return matches