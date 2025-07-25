from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from pymongo import MongoClient
from bson import ObjectId
from uuid import uuid4
from datetime import datetime, timedelta
import hashlib
import base64
import json
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# MongoDB Connection
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["edu_app"]
users_collection = db["users"]

# Constants
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Models
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "student"

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

# Helpers
def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    data.update({"exp": expire.isoformat()})
    json_data = json.dumps(data)
    token = base64.urlsafe_b64encode(json_data.encode()).decode()
    return token

def decode_token(token: str) -> dict:
    try:
        json_data = base64.urlsafe_b64decode(token.encode()).decode()
        return json.loads(json_data)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@router.post("/register", response_model=dict)
async def register(user: UserRegister):
    if not user.email or not user.password or not user.name:
        raise HTTPException(status_code=400, detail="Missing required fields")

    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=409, detail="Email already exists")

    hashed_pw = get_password_hash(user.password)
    users_collection.insert_one({
        "col_id": str(uuid4()),
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "role": user.role,
    })
    return {"message": "Registered successfully"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Bad credentials")

    token = create_access_token(
        data={"sub": str(user["_id"]), "name": user["name"], "role": user["role"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"]
    }
