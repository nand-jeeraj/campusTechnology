from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

security = HTTPBearer()

class MeetingCreate(BaseModel):
    title: str
    time: str  # Consider using datetime if you want proper datetime validation
    link: str

class MeetingResponse(BaseModel):
    title: str
    time: str
    link: str
    created_by: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # In a real implementation, you would verify the JWT token here
        # This is just a placeholder to match the Flask JWT functionality
        # You should implement proper JWT verification
        token_data = credentials.credentials
        return {"sub": token_data, "name": "Faculty Name", "role": "faculty"}  # Placeholder
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("http://localhost:8000/meetings", status_code=201)
async def create_meeting(
    meeting: MeetingCreate,
    user: dict = Depends(get_current_user)
):
    if user.get("role") != "faculty":
        raise HTTPException(status_code=403, detail="Unauthorized")

    meeting_data = {
        "col_id": str(uuid4()),
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
