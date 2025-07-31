from fastapi import APIRouter, HTTPException, Body
from pymongo import MongoClient
from datetime import datetime
from uuid import uuid4
import os
from dotenv import load_dotenv
from typing import List
from pydantic import BaseModel

load_dotenv()

router = APIRouter()

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
meetings_collection = db["meetings"]

# Models
class MeetingCreate(BaseModel):
    title: str
    time: str  # Consider using datetime if needed
    link: str

class MeetingResponse(BaseModel):
    title: str
    time: str
    link: str
    created_by: str

@router.post("/meetings", status_code=201)
async def create_meeting(meeting: MeetingCreate):
    # Dummy user used in place of actual authentication
    user = {
        "name": "Anonymous Faculty",
        "role": "faculty"
    }

    meeting_data = {
        "col_id": str(uuid4()) or "col id",
        "title": meeting.title,
        "time": meeting.time,
        "link": meeting.link,
        "created_by": user.get("name", "Unknown"),
        "created_at": datetime.utcnow(),
    }

    try:
        meetings_collection.insert_one(meeting_data)
        return {"message": "Meeting created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/meetings", response_model=List[MeetingResponse])
async def list_meetings():
    try:
        meetings = meetings_collection.find().sort("time", 1)
        result = []
        for m in meetings:
            result.append({
                "title": m["title"],
                "time": m["time"],
                "link": m["link"],
                "created_by": m.get("created_by", "Unknown"),
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
