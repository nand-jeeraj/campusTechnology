from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from uuid import uuid4
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel

load_dotenv()

router = APIRouter()

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
announcements_collection = db["announcements"]

security = HTTPBearer()

class AnnouncementCreate(BaseModel):
    title: str
    message: str

class Announcement(BaseModel):
    _id: Optional[str] = None
    col_id: str
    title: str
    message: str
    created_by: str
    created_at: datetime

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # In a real implementation, you would verify the JWT token here
        # For now, we'll just return the user from the token
        # This should match your actual JWT implementation
        user = {
            "name": "Faculty User",  # This would come from the token
            "role": "faculty"       # This would come from the token
        }
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/announcements")
async def create_announcement(
    announcement: AnnouncementCreate,
    user: dict = Depends(get_current_user)
):
    try:
        if user["role"] != "faculty":
            raise HTTPException(status_code=403, detail="Only faculty can post announcements")

        announcement_dict = {
            "col_id": str(uuid4()),
            "title": announcement.title,
            "message": announcement.message,
            "created_by": user["name"],
            "created_at": datetime.utcnow()
        }
        result = announcements_collection.insert_one(announcement_dict)
        return {"message": "Announcement created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/announcements")
async def get_announcements():
    try:
        announcements = list(announcements_collection.find().sort("created_at", -1))
        result = []
        for a in announcements:
            result.append({
                "_id": str(a["_id"]),
                "title": a["title"],
                "message": a["message"],
                "created_by": a.get("created_by", "Unknown"),
                "created_at": a.get("created_at")
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
