from fastapi import FastAPI, APIRouter, HTTPException, Body, Path
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
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

def get_dummy_user():
    import json
    try:
        # Assume the frontend sets 'user_name' and 'user_role' in localStorage
        from starlette.requests import Request
        request = Request(scope={})
        user_name = request.headers.get("x-user-name") or "Anonymous User"
        user_role = request.headers.get("x-user-role") or "faculty"
    except:
        user_name = "Anonymous User"
        user_role = "faculty"

    return {
        "_id": ObjectId(),         
        "name": user_name,         
        "role": user_role          
    }


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
async def post_discussion(discussion: DiscussionCreate):
    user = get_dummy_user()
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
        discussions_collection.insert_one(discussion_dict)
        return {"message": "Discussion posted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/discussions/{discussion_id}/comment")
async def add_comment(
    discussion_id: str = Path(...),
    comment: CommentCreate = Body(...)
):
    user = get_dummy_user()
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
    discussion_id: str = Path(...),
    comment_id: str = Path(...)
):
    user = get_dummy_user()
    try:
        # Since there's no auth, we assume dummy user is faculty
        # Remove this check if you want completely unrestricted access
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

# Include router
app.include_router(router)
