from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

router = Blueprint('quizzes', __name__)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
quizzes_collection = db["quizzes"]
scheduled_quizzes_collection = db["scheduled_quizzes"]

@router.route("/quizzes", methods=["POST"])
def create_quiz():
    try:
        quiz = request.get_json()
        # Ensure each question has a type and ID
        for question in quiz["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
            if not question.get("type"):
                question["type"] = "mcq"  # Default to MCQ if type not specified
        result = quizzes_collection.insert_one(quiz)
        return jsonify({"message": "Quiz created successfully", "id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/scheduled-quizzes", methods=["POST"])
def create_scheduled_quiz():
    try:
        quiz = request.get_json()
        # Add IDs to each question if not provided
        for question in quiz["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
        scheduled_quizzes_collection.insert_one(quiz)
        return jsonify({"message": "Scheduled quiz created successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/quizzes", methods=["GET"])
def get_quizzes():
    try:
        quizzes = list(quizzes_collection.find({}))
        for quiz in quizzes:
            quiz["_id"] = str(quiz["_id"])
        return jsonify(quizzes)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@router.route("/scheduled-quizzes", methods=["GET"])
def get_scheduled_quizzes():
    try:
        quizzes = list(scheduled_quizzes_collection.find({}))
        for quiz in quizzes:
            quiz["_id"] = str(quiz["_id"])
        return jsonify(quizzes)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@router.route("/quizzes/<quiz_id>", methods=["DELETE"])
def delete_quiz(quiz_id):
    result = quizzes_collection.delete_one({"_id": ObjectId(quiz_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Quiz deleted successfully"})
    return jsonify({"detail": "Quiz not found"}), 404

@router.route("/scheduled-quizzes/<quiz_id>", methods=["DELETE"])
def delete_scheduled_quiz(quiz_id):
    result = scheduled_quizzes_collection.delete_one({"_id": ObjectId(quiz_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Scheduled quiz deleted successfully"})
    return jsonify({"detail": "Scheduled quiz not found"}), 404

@router.route("/scheduled-quizzes/<quiz_id>", methods=["PUT"])
def update_scheduled_quiz(quiz_id):
    try:
        data = request.get_json()
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
            return jsonify({"message": "Scheduled quiz updated successfully"})
        return jsonify({"detail": "Scheduled quiz not found"}), 404
    except Exception as e:
        return jsonify({"detail": str(e)}), 400