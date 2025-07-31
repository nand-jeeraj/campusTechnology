from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
assignments_collection = db["assignments"]
scheduled_assignments_collection = db["scheduled_assignments"]

class FileUploadQuestion(BaseModel):
    type: str = Field(default="file_upload")
    question: str
    file_types: List[str]  # e.g., ["pdf", "docx", "ppt"]
    max_size_mb: int = Field(default=10)  # Max file size in MB

class TextResponseQuestion(BaseModel):
    type: str = Field(default="text_response")
    question: str
    word_limit: Optional[int] = None

class CodingQuestion(BaseModel):
    type: str = Field(default="coding")
    question: str
    language: str  # e.g., "python", "java", "javascript"
    test_cases: List[str]

Question = Union[FileUploadQuestion, TextResponseQuestion, CodingQuestion]
class Question(BaseModel):
    id: Optional[str] = None
    question: str
    type: str
    file_types: Optional[List[str]] = None
    max_size_mb: Optional[int] = None
    word_limit: Optional[int] = None
    language: Optional[str] = None
    test_cases: Optional[List[str]] = None

class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[Question]

class AssignmentCreate(AssignmentBase):
    pass

class ScheduledAssignmentCreate(AssignmentBase):
    start_time: datetime
    end_time: datetime
    submission_limit: Optional[int] = 1  # Number of allowed submissions

@router.post("/assignments")
async def create_assignment(assignment: AssignmentCreate):
    try:
        assignment_dict = assignment.dict()
        # Ensure each question has a type and ID
        for question in assignment_dict["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
            if not question.get("type"):
                question["type"] = "text_response"  # Default to text response if type not specified
        result = assignments_collection.insert_one(assignment_dict)
        return {"message": "Assignment created successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/scheduled-assignments")
async def create_scheduled_assignment(assignment: ScheduledAssignmentCreate):
    try:
        assignment_dict = assignment.dict()
        # Add IDs to each question if not provided
        for question in assignment_dict["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
        scheduled_assignments_collection.insert_one(assignment_dict)
        return {"message": "Scheduled assignment created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/assignments")
async def get_assignments():
    try:
        assignments = list(assignments_collection.find({}))
        for assignment in assignments:
            assignment["_id"] = str(assignment["_id"])
        return assignments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduled-assignments")
async def get_scheduled_assignments():
    try:
        assignments = list(scheduled_assignments_collection.find({}))
        for assignment in assignments:
            assignment["_id"] = str(assignment["_id"])
        return assignments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))