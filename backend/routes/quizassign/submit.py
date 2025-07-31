from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from database import submission_collection, quiz_collection
import requests

router = APIRouter()

class Submission(BaseModel):
    user_id: str
    quiz_title: str
    answers: dict  # { qid: answer }

@router.post("/submit")
def submit_quiz(data: Submission):
    existing = submission_collection.find_one({
        "user_id": data.user_id,
        "quiz_title": data.quiz_title
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already submitted")

    quiz = quiz_collection.find_one({"title": data.quiz_title})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    result = {
        "user_id": data.user_id,
        "quiz_title": data.quiz_title,
        "submitted_at": datetime.utcnow(),
        "score": 0,
        "details": []
    }

    correct_count = 0
    total_questions = len(quiz["questions"])

    for q in quiz["questions"]:
        qid = q["id"]
        correct = q["answer"]
        user_ans = data.answers.get(qid, "")
        score = 0
        feedback = ""

        if q["type"] == "mcq":
            if user_ans == correct:
                score = 1
        elif q["type"] == "descriptive":
            try:
                res = requests.post("http://localhost:8000/evaluate-descriptive", json={
                    "student_answer": user_ans,
                    "correct_answer": correct
                })
                score = 1 if res.json()["score"] >= 50 else 0
                feedback = res.json().get("feedback", "")
            except:
                score = 0
                feedback = "Error during evaluation"

        correct_count += score
        result["details"].append({
            "qid": qid,
            "correct": score == 1,
            "feedback": feedback
        })

    result["score"] = f"{correct_count} / {total_questions}"
    submission_collection.insert_one(result)

    return {"msg": "Submitted", "result": result}
