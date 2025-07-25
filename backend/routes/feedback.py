from fastapi import APIRouter, HTTPException, Depends, Body, Path
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel
from uuid import uuid4

load_dotenv()

router = APIRouter()

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
feedback_collection = db["feedback"]

security = HTTPBearer()

class FeedbackComment(BaseModel):
    author: str
    text: str
    created_at: datetime

class FeedbackResponse(BaseModel):
    response: str

class FeedbackCreate(BaseModel):
    text: str
    faculty_id: str
    rating: int

class FeedbackCommentCreate(BaseModel):
    text: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # In a real implementation, you would verify the JWT token here
        # For now, we'll just return the user info from the token
        # This should be replaced with actual JWT verification
        user_id = credentials.credentials
        user = {
            "_id": user_id,
            "name": "Test User",  # This should come from your JWT or DB
            "role": "student"    # This should come from your JWT or DB
        }
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/feedback")
async def submit_feedback(
    feedback: FeedbackCreate,
    user: dict = Depends(get_current_user)
):
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can submit feedback")

    try:
        feedback_dict = {
            "col_id": str(uuid4()),
            "student_id": str(user["_id"]),
            "student_name": user["name"],
            "faculty_id": feedback.faculty_id,
            "text": feedback.text,
            "rating": feedback.rating,
            "created_at": datetime.utcnow(),
            "comments": []
        }
        feedback_collection.insert_one(feedback_dict)
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/feedback")
async def get_feedback(user: dict = Depends(get_current_user)):
    if user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can view feedback")

    try:
        feedbacks = list(feedback_collection.find().sort("created_at", -1))
        result = []
        for f in feedbacks:
            result.append({
                "_id": str(f["_id"]),
                "student_name": f["student_name"],
                "text": f["text"],
                "created_at": f["created_at"],
                "comments": f.get("comments", [])
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback/{fid}/comment")
async def comment_feedback(
    fid: str = Path(..., description="The ID of the feedback"),
    comment: FeedbackCommentCreate = Body(...),
    user: dict = Depends(get_current_user)
):
    if user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can comment")

    try:
        result = feedback_collection.update_one(
            {"_id": ObjectId(fid)},
            {"$push": {"comments": {
                "author": user["name"],
                "text": comment.text,
                "created_at": datetime.utcnow()
            }}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"message": "Comment added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/feedback/{fid}/response")
async def respond_to_feedback(
    fid: str = Path(..., description="The ID of the feedback"),
    response: FeedbackResponse = Body(...),
    user: dict = Depends(get_current_user)
):
    if user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can respond")

    try:
        result = feedback_collection.update_one(
            {"_id": ObjectId(fid)},
            {"$set": {"response": response.response}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"message": "Response added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
