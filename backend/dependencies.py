from fastapi import Depends, HTTPException, status

def get_current_user():
    # Replace this with real authentication later (JWT, session, etc.)
    return {"id": "admin123", "username": "admin"}
