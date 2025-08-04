from flask import Blueprint, jsonify
from database import submission_collection, assignment_submission_collection

router = Blueprint('Student_view', __name__)

@router.route("/Student-submissions/<string:user_id>", methods=["GET"])
def Student_history(user_id):
    quizzes = list(submission_collection.find({"user_id": user_id}, {"_id": 0}))
    assignments = list(assignment_submission_collection.find({"user_id": user_id}, {"_id": 0}))
    return jsonify({
        "quizzes": quizzes,
        "assignments": assignments
    })