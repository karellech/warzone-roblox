from fastapi import FastAPI
from app.database import Base, engine
from app import models  # important : importe les modèles pour qu'ils soient connus

Base.metadata.create_all(bind=engine)  # crée les tables directement

app = FastAPI(title="WarZone API")

@app.get("/")
def root():
    return {"status": "ok"}