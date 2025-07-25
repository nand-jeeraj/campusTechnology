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
ratings_collection = db["ratings"]
course_ratings_collection = db["course_ratings"]
users_collection = db["users"]

security = HTTPBearer()

class RatingSubmit(BaseModel):
    faculty_id: str
    rating: int
    comment: Optional[str] = ""

class CourseRatingSubmit(BaseModel):
    course_name: str
    rating: int
    comment: Optional[str] = ""

class RatingResponse(BaseModel):
    student_name: str
    rating: int
    comment: str
    created_at: str

class CourseRatingResponse(BaseModel):
    course_name: str
    student_name: str
    rating: int
    comment: str
    created_at: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # In a real implementation, you would verify the JWT token here
        user_id = credentials.credentials
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/rate")
async def submit_rating(
    rating_data: RatingSubmit,
    user: dict = Depends(get_current_user)
):
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can rate")

    try:
        rating_dict = {
            "col_id": str(uuid4()),
            "faculty_id": rating_data.faculty_id,
            "student_id": str(user["_id"]),
            "rating": rating_data.rating,
            "comment": rating_data.comment,
            "created_at": datetime.utcnow()
        }
        ratings_collection.insert_one(rating_dict)
        return {"message": "Rating submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ratings/{faculty_id}")
async def get_ratings(
    faculty_id: str = Path(..., description="The ID of the faculty to get ratings for"),
    user: dict = Depends(get_current_user)
):
    try:
        ratings = list(ratings_collection.find({"faculty_id": faculty_id}))
        result = []
        for r in ratings:
            student = users_collection.find_one({"_id": ObjectId(r["student_id"])})
            result.append({
                "student_name": student["name"] if student else "Unknown",
                "rating": r["rating"],
                "comment": r.get("comment", ""),
                "created_at": r["created_at"].isoformat()
            })
        return {"ratings": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/course-ratings")
async def submit_course_rating(
    course_rating: CourseRatingSubmit,
    user: dict = Depends(get_current_user)
):
    try:
        if not course_rating.course_name or not course_rating.rating:
            raise HTTPException(status_code=400, detail="Course name and rating are required")

        rating_dict = {
            "student_id": str(user["_id"]),
            "course_name": course_rating.course_name,
            "rating": course_rating.rating,
            "comment": course_rating.comment,
            "created_at": datetime.utcnow()
        }
        course_ratings_collection.insert_one(rating_dict)
        return {"message": "Course rating submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/faculty-view-course-ratings")
async def view_all_course_ratings(user: dict = Depends(get_current_user)):
    try:
        ratings = list(course_ratings_collection.find())
        results = []
        for r in ratings:
            student = users_collection.find_one({"_id": ObjectId(r["student_id"])})
            results.append({
                "course_name": r.get("course_name", "Unknown Course"),
                "student_name": student["name"] if student else "Unknown Student",
                "rating": r["rating"],
                "comment": r.get("comment", ""),
                "created_at": r["created_at"].isoformat() if "created_at" in r else ""
            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/faculty-course-ratings")
async def get_faculty_course_ratings(user: dict = Depends(get_current_user)):
    try:
        ratings = list(course_ratings_collection.find())
        result = [{
            "course_name": r.get("course_name", "N/A"),
            "student_name": r.get("student_name", "Unknown"),
            "rating": r.get("rating", 0),
            "comment": r.get("comment", ""),
            "created_at": r["created_at"].isoformat() if "created_at" in r else ""
        } for r in ratings]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
