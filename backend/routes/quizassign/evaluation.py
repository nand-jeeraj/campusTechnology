from fastapi import APIRouter
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

router = APIRouter()

class AnswerInput(BaseModel):
    student_answer: str
    correct_answer: str

@router.post("/evaluate-descriptive")
def evaluate_descriptive(data: AnswerInput):
    vectorizer = TfidfVectorizer().fit([data.correct_answer, data.student_answer])
    vecs = vectorizer.transform([data.correct_answer, data.student_answer])
    similarity = cosine_similarity(vecs[0:1], vecs[1:2])[0][0]

    score = round(similarity * 100)

    # ✨ Add feedback logic
    if score >= 80:
        feedback = "Excellent! You covered almost everything clearly."
    elif score >= 60:
        feedback = "Good. You addressed key points, but could improve clarity or detail."
    elif score >= 40:
        feedback = "Partial answer. Some concepts are missing or unclear."
    else:
        feedback = "Needs improvement. Please review the topic again."

    return {
        "score": score,
        "feedback": feedback
    }
