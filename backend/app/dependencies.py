import os
from fastapi import Header, HTTPException

ROBLOX_API_KEY = os.getenv("ROBLOX_API_KEY", "mon-secret-local")

def verify_roblox_key(x_api_key: str = Header(...)):
    if x_api_key != ROBLOX_API_KEY:
        raise HTTPException(status_code=401, detail="Clé API invalide")