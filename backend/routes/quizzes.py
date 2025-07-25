from fastapi import APIRouter, HTTPException, Path, Body
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
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["edu_app"]
quizzes_collection = db["quizzes"]
scheduled_quizzes_collection = db["scheduled_quizzes"]

class MCQQuestion(BaseModel):
    type: str = Field(default="mcq")
    question: str
    options: List[str]
    answer: str

class DescriptiveQuestion(BaseModel):
    type: str = Field(default="descriptive")
    question: str
    answer: str

Question = Union[MCQQuestion, DescriptiveQuestion]
class Question(BaseModel):
    id: Optional[str] = None
    question: str
    type: str
    options: Optional[List[str]] = None
    answer: str

class QuizBase(BaseModel):
    title: str
    questions: List[Question]

class QuizCreate(QuizBase):
    pass

class ScheduledQuizCreate(QuizBase):
    start_time: datetime
    end_time: datetime
    duration_minutes: int

@router.post("/quizzes")
async def create_quiz(quiz: QuizCreate):
    try:
        quiz_dict = quiz.dict()
        # Ensure each question has a type and ID
        for question in quiz_dict["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
            if not question.get("type"):
                question["type"] = "mcq"  # Default to MCQ if type not specified
        result = quizzes_collection.insert_one(quiz_dict)
        return {"message": "Quiz created successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/scheduled-quizzes")
async def create_scheduled_quiz(quiz: ScheduledQuizCreate):
    try:
        quiz_dict = quiz.dict()
        # Add IDs to each question if not provided
        for question in quiz_dict["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
        scheduled_quizzes_collection.insert_one(quiz_dict)
        return {"message": "Scheduled quiz created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/quizzes")
async def get_quizzes():
    try:
        quizzes = list(quizzes_collection.find({}))
        for quiz in quizzes:
            quiz["_id"] = str(quiz["_id"])
        return quizzes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduled-quizzes")
async def get_scheduled_quizzes():
    try:
        quizzes = list(scheduled_quizzes_collection.find({}))
        for quiz in quizzes:
            quiz["_id"] = str(quiz["_id"])
        return quizzes

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str = Path(..., description="The ID of the quiz to delete")):
    result = quizzes_collection.delete_one({"_id": ObjectId(quiz_id)})
    if result.deleted_count == 1:
        return {"message": "Quiz deleted successfully"}
    raise HTTPException(status_code=404, detail="Quiz not found")

@router.delete("/scheduled-quizzes/{quiz_id}")
async def delete_scheduled_quiz(quiz_id: str = Path(..., description="The ID of the scheduled quiz to delete")):
    result = scheduled_quizzes_collection.delete_one({"_id": ObjectId(quiz_id)})
    if result.deleted_count == 1:
        return {"message": "Scheduled quiz deleted successfully"}
    raise HTTPException(status_code=404, detail="Scheduled quiz not found")

@router.put("/scheduled-quizzes/{quiz_id}")
async def update_scheduled_quiz(
    quiz_id: str = Path(..., description="The ID of the scheduled quiz to update"),
    data: dict = Body(...)
):
    update_fields = {}
    if "title" in data:
        update_fields["title"] = data["title"]
    if "start_time" in data:
        update_fields["start_time"] = datetime.fromisoformat(data["start_time"])
    if "end_time" in data:
        update_fields["end_time"] = datetime.fromisoformat(data["end_time"])
    if "duration_minutes" in data:
        update_fields["duration_minutes"] = data["duration_minutes"]

    result = scheduled_quizzes_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$set": update_fields}
    )
    if result.modified_count == 1:
        return {"message": "Scheduled quiz updated successfully"}
    raise HTTPException(status_code=404, detail="Scheduled quiz not found")
