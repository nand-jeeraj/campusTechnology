"""from fastapi import APIRouter, FastAPI
from typing import List, Dict
from pydantic import BaseModel
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssignmentBlock(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime

class Question(BaseModel):
    id: str
    type: str  # "mcq" or "descriptive"
    question: str
    options: List[str] = []  # Only for MCQ
    answer: str

@router.get("/assignment-blocks", response_model=List[AssignmentBlock])
def get_assignment_blocks():
    "Get all assignment blocks (titles) without questions"
    blocks = []
    for assignment in assignment_collection.find({}, {"questions": 0}):
        blocks.append({
            "title": assignment["title"],
            "description": assignment.get("description", ""),
            "start_time": assignment["start_time"],
            "end_time": assignment["end_time"]
        })
    return blocks

@router.get("/assignment/{title}", response_model=Dict)
def get_assignment_by_title(title: str):
    "Get full assignment with questions by title"
    assignment = assignment_collection.find_one({"title": title})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment"""