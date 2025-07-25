from fastapi import FastAPI, APIRouter
from routes import (quizzes, assignments, evaluation, submission, evaluation, 
                    generate_questions, explain_answers, discussions, announcements, 
                    auth, feedback, meetings, ratings, users)
from fastapi.middleware.cors import CORSMiddleware
from routes.assignment_fetch import router as assignment_fetch_router
from routes.admin_view import router as admin_router
from routes.student_view import router as student_router
from pydantic import BaseModel
from difflib import SequenceMatcher
import uvicorn

app = FastAPI()
router = APIRouter()

class EvalRequest(BaseModel):
    student_answer: str
    correct_answer: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Allow ALL origins (or "http://localhost:3000" only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(evaluation.router)
app.include_router(quizzes.router)
app.include_router(assignments.router)
app.include_router(evaluation.router)
app.include_router(submission.router)
app.include_router(assignment_fetch_router)
app.include_router(admin_router)
app.include_router(student_router)
app.include_router(generate_questions.router)
app.include_router(explain_answers.router)
app.include_router(discussions.router)
app.include_router(announcements.router)
app.include_router(feedback.router)
app.include_router(meetings.router)
app.include_router(ratings.router)
app.include_router(users.router)

@router.post("/evaluate-descriptive")
def evaluate_descriptive(data: EvalRequest):
    similarity = SequenceMatcher(None, data.student_answer.lower(), data.correct_answer.lower()).ratio()
    score = round(similarity * 100)  # Return score in percentage

    feedback = "Great job!" if score >= 80 else "Needs improvement"
    return { "score": score, "feedback": feedback }

@app.get("/")
def root():
    return {"msg": "Quiz & Assignment Backend is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    