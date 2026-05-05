from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models  # noqa: F401 — nécessaire pour que SQLAlchemy détecte les tables
from app.routers import players, matches, leaderboard

# Crée toutes les tables si elles n'existent pas encore
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WarZone API",
    description="Backend du jeu de guerre multijoueur Roblox",
    version="1.0.0",
)

# CORS — autorise le dashboard React (localhost:3000) à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routers
app.include_router(players.router)
app.include_router(matches.router)
app.include_router(leaderboard.router)

@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}