from flask import Blueprint, request, jsonify
from datetime import datetime
from database import submission_collection, quiz_collection
import requests

router = Blueprint('submit', __name__)

class Submission:
    def __init__(self, user_id: str, quiz_title: str, answers: dict):
        self.user_id = user_id
        self.quiz_title = quiz_title
        self.answers = answers

@router.route("/submit", methods=["POST"])
def submit_quiz():
    data = request.get_json()
    submission = Submission(
        user_id=data['user_id'],
        quiz_title=data['quiz_title'],
        answers=data['answers']
    )
    
    existing = submission_collection.find_one({
        "user_id": submission.user_id,
        "quiz_title": submission.quiz_title
    })
    if existing:
        return jsonify({"detail": "Already submitted"}), 400

    quiz = quiz_collection.find_one({"title": submission.quiz_title})
    if not quiz:
        return jsonify({"detail": "Quiz not found"}), 404

    result = {
        "user_id": submission.user_id,
        "quiz_title": submission.quiz_title,
        "submitted_at": datetime.utcnow(),
        "score": 0,
        "details": []
    }

    correct_count = 0
    total_questions = len(quiz["questions"])

    for q in quiz["questions"]:
        qid = q["id"]
        correct = q["answer"]
        user_ans = submission.answers.get(qid, "")
        score = 0
        feedback = ""

        if q["type"] == "mcq":
            if user_ans == correct:
                score = 1
        elif q["type"] == "descriptive":
            try:
                res = requests.post("http://localhost:8000/evaluate-descriptive", json={
                    "Student_answer": user_ans,
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

    return jsonify({"msg": "Submitted", "result": result})