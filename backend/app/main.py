from fastapi import FastAPI
from app.database import Base, engine
from app import models
from app.routers import matches, players, leaderboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="WarZone API")

app.include_router(matches.router)
app.include_router(players.router)
app.include_router(leaderboard.router)

@app.get("/")
def root():
    return {"status": "ok"}