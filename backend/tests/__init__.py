import pytest
from fastapi.testclient import TestClient
from app.main import app

# TestClient simule des requêtes HTTP sans avoir besoin
# que le serveur tourne vraiment
client = TestClient(app)


# ── Tests Players ────────────────────────────────────────────

def test_root():
    """L'API répond correctement."""
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_create_player():
    """Créer un joueur retourne 201 avec les bonnes données."""
    r = client.post("/api/players/", json={
        "roblox_user_id": 999999001,
        "username": "TestPlayer1"
    })
    assert r.status_code == 201
    data = r.json()
    assert data["username"] == "TestPlayer1"
    assert data["roblox_user_id"] == 999999001
    assert data["grade"] == "Recrue"
    assert data["total_kills"] == 0


def test_create_player_duplicate():
    """Créer un joueur déjà existant met à jour son username (pas d'erreur)."""
    client.post("/api/players/", json={
        "roblox_user_id": 999999002,
        "username": "OldName"
    })
    r = client.post("/api/players/", json={
        "roblox_user_id": 999999002,
        "username": "NewName"
    })
    assert r.status_code == 201
    assert r.json()["username"] == "NewName"


def test_get_player():
    """Récupérer un joueur existant retourne 200."""
    client.post("/api/players/", json={
        "roblox_user_id": 999999003,
        "username": "GetMe"
    })
    r = client.get("/api/players/999999003")
    assert r.status_code == 200
    assert r.json()["username"] == "GetMe"


def test_get_player_not_found():
    """Récupérer un joueur inexistant retourne 404."""
    r = client.get("/api/players/000000000")
    assert r.status_code == 404


# ── Tests Matches ────────────────────────────────────────────

def test_create_match():
    """Créer une partie retourne 201 avec status ongoing."""
    r = client.post("/api/matches/", json={"player_count": 8})
    assert r.status_code == 201
    data = r.json()
    assert data["status"] == "ongoing"
    assert data["winning_team"] is None


def test_list_matches():
    """Lister les parties retourne une liste."""
    r = client.get("/api/matches/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_end_match():
    """Terminer une partie met à jour son statut et son gagnant."""
    # Créer une partie
    match_id = client.post("/api/matches/", json={"player_count": 4}).json()["id"]

    # La terminer
    r = client.post(f"/api/matches/{match_id}/end", json={
        "winning_team": "Red",
        "duration_seconds": 245
    })
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "finished"
    assert data["winning_team"] == "Red"
    assert data["duration_seconds"] == 245


def test_kills_batch():
    """Envoyer un batch de kills retourne 201."""
    # Créer deux joueurs et une partie
    client.post("/api/players/", json={"roblox_user_id": 999999010, "username": "Killer"})
    client.post("/api/players/", json={"roblox_user_id": 999999011, "username": "Victim"})
    match_id = client.post("/api/matches/", json={"player_count": 2}).json()["id"]

    r = client.post(f"/api/matches/{match_id}/kills", json={"kills": [
        {
            "killer_roblox_id": 999999010,
            "victim_roblox_id": 999999011,
            "weapon": "ClassicSword",
            "killer_team": "Red",
            "timestamp_offset": 42
        }
    ]})
    assert r.status_code == 201
    assert r.json()["inserted"] == 1


def test_kills_batch_updates_player_stats():
    """Après un batch de kills, les stats du joueur sont mises à jour."""
    client.post("/api/players/", json={"roblox_user_id": 999999020, "username": "StatKiller"})
    client.post("/api/players/", json={"roblox_user_id": 999999021, "username": "StatVictim"})
    match_id = client.post("/api/matches/", json={"player_count": 2}).json()["id"]

    # Envoyer 3 kills
    client.post(f"/api/matches/{match_id}/kills", json={"kills": [
        {"killer_roblox_id": 999999020, "victim_roblox_id": 999999021,
         "weapon": "RayGun", "killer_team": "Blue", "timestamp_offset": i}
        for i in range(3)
    ]})

    # Vérifier les stats
    killer = client.get("/api/players/999999020").json()
    victim = client.get("/api/players/999999021").json()
    assert killer["total_kills"] == 3
    assert victim["total_deaths"] == 3


# ── Tests Leaderboard ────────────────────────────────────────

def test_leaderboard():
    """Le leaderboard retourne une liste triée par kills."""
    r = client.get("/api/leaderboard/")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    # Vérifier que les rangs sont dans l'ordre
    if len(data) >= 2:
        assert data[0]["total_kills"] >= data[1]["total_kills"]


def test_leaderboard_has_rank_field():
    """Chaque entrée du leaderboard a un champ rank."""
    r = client.get("/api/leaderboard/")
    data = r.json()
    if data:
        assert "rank" in data[0]
        assert "kd_ratio" in data[0]