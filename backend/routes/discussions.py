from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body, Path
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

router = APIRouter()

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
discussions_collection = db["discussions"]
users_collection = db["users"]

security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Comment(BaseModel):
    comment_id: str
    author_id: str
    author: str
    author_role: str
    text: str
    created_at: datetime

class Discussion(BaseModel):
    _id: Optional[str] = None
    user_id: str
    author_name: str
    author_role: str
    title: str
    body: str
    created_at: datetime
    comments: List[Comment] = []

class DiscussionCreate(BaseModel):
    title: str
    body: str

class CommentCreate(BaseModel):
    text: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # In a real implementation, you would verify the JWT token here
        # For now, we'll just return the user ID from the token
        user_id = credentials.credentials
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/discussions")
async def get_discussions():
    try:
        discussions = list(discussions_collection.find().sort("created_at", -1))
        for d in discussions:
            d["_id"] = str(d["_id"])
            d["body"] = d.get("body") or d.get("content") or ""
            for c in d.get("comments", []):
                c["created_at"] = c["created_at"].isoformat()
        return discussions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/discussions")
async def post_discussion(
    discussion: DiscussionCreate,
    user: dict = Depends(get_current_user)
):
    try:
        discussion_dict = {
            "user_id": str(user["_id"]),
            "author_name": user["name"],
            "author_role": user["role"],
            "title": discussion.title,
            "body": discussion.body,
            "created_at": datetime.utcnow(),
            "comments": []
        }
        result = discussions_collection.insert_one(discussion_dict)
        return {"message": "Discussion posted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/discussions/{discussion_id}/comment")
async def add_comment(
    discussion_id: str = Path(..., description="The ID of the discussion"),
    comment: CommentCreate = Body(...),
    user: dict = Depends(get_current_user)
):
    try:
        if not comment.text:
            raise HTTPException(status_code=400, detail="Comment text required")

        new_comment = {
            "comment_id": str(ObjectId()),
            "author_id": str(user["_id"]),
            "author": user["name"],
            "author_role": user["role"],
            "text": comment.text,
            "created_at": datetime.utcnow()
        }

        result = discussions_collection.update_one(
            {"_id": ObjectId(discussion_id)},
            {"$push": {"comments": new_comment}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Discussion not found")
        return {"message": "Comment added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/discussions/{discussion_id}/comment/{comment_id}")
async def delete_comment(
    discussion_id: str = Path(..., description="The ID of the discussion"),
    comment_id: str = Path(..., description="The ID of the comment to delete"),
    user: dict = Depends(get_current_user)
):
    try:
        if user["role"] != "faculty":
            raise HTTPException(status_code=403, detail="Only faculty can delete comments")

        result = discussions_collection.update_one(
            {"_id": ObjectId(discussion_id)},
            {"$pull": {"comments": {"comment_id": comment_id}}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Comment not found or already deleted")
        return {"message": "Comment deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
