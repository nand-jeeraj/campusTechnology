from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Option(BaseModel):
    text: str

class Question(BaseModel):
    id: str
    type: str  # "mcq" or "descriptive"
    question: str
    options: Optional[List[str]] = []
    answer: str

class Quiz(BaseModel):
    title: str
    questions: List[Question]
    start_time: datetime
    end_time: datetime
    duration_minutes: int

class Assignment(BaseModel):
    title: str
    questions: List[Question]
    start_time: datetime
    end_time: datetime

class Submission(BaseModel):
    user_id: str
    quiz_id: str
    answers: dict
    submitted_at: datetime

class QuizSubmission(BaseModel):
    user_id: str
    quiz_title: str
    answers: dict
    submitted_at: datetime
