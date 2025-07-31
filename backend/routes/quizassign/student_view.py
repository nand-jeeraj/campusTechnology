from fastapi import APIRouter
from database import submission_collection, assignment_submission_collection

router = APIRouter()

@router.get("/student-submissions/{user_id}")
def student_history(user_id: str):
    quizzes = list(submission_collection.find({"user_id": user_id}, {"_id": 0}))
    assignments = list(assignment_submission_collection.find({"user_id": user_id}, {"_id": 0}))
    return {
        "quizzes": quizzes,
        "assignments": assignments
    }
