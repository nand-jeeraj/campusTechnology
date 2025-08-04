from flask import g, abort

def get_current_user():
    # Replace this with real authentication later (JWT, session, etc.)
    return {"id": "Faculty123", "username": "Faculty"}
