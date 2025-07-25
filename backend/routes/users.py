from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from typing import List
from pydantic import BaseModel

load_dotenv()

router = APIRouter()

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
users_collection = db["users"]

security = HTTPBearer()

class UserResponse(BaseModel):
    _id: str
    name: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # In a real implementation, you would verify the JWT token here
        # For now, we'll just return the token
        token = credentials.credentials
        return token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/users", response_model=List[UserResponse])
async def get_users_by_role(
    role: str = Query(..., description="Role to filter users by"),
    token: str = Depends(get_current_user)
):
    try:
        users = users_collection.find({"role": role})
        return [{"_id": str(user["_id"]), "name": user["name"]} for user in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
