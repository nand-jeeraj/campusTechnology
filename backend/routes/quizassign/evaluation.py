from flask import Blueprint, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

router = Blueprint('evaluation', __name__)

class AnswerInput:
    def __init__(self, Student_answer: str, correct_answer: str):
        self.Student_answer = Student_answer
        self.correct_answer = correct_answer

@router.route("/evaluate-descriptive", methods=["POST"])
def evaluate_descriptive():
    data = request.get_json()
    answer_input = AnswerInput(
        Student_answer=data['Student_answer'],
        correct_answer=data['correct_answer']
    )
    
    vectorizer = TfidfVectorizer().fit([answer_input.correct_answer, answer_input.Student_answer])
    vecs = vectorizer.transform([answer_input.correct_answer, answer_input.Student_answer])
    similarity = cosine_similarity(vecs[0:1], vecs[1:2])[0][0]

    score = round(similarity * 100)

    # ✨ Add feedback logic (identical to original)
    if score >= 80:
        feedback = "Excellent! You covered almost everything clearly."
    elif score >= 60:
        feedback = "Good. You addressed key points, but could improve clarity or detail."
    elif score >= 40:
        feedback = "Partial answer. Some concepts are missing or unclear."
    else:
        feedback = "Needs improvement. Please review the topic again."

    return jsonify({
        "score": score,
        "feedback": feedback
    })