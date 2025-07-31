from fastapi import APIRouter, HTTPException, Body
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

# Pydantic Models
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

@router.post("/announcements")
async def create_announcement(announcement: AnnouncementCreate):
    try:
        # Dummy user for simulation (since auth removed)
        user = {
            "name": "Anonymous User",  # default author
            "role": "faculty"          # default role
        }

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
