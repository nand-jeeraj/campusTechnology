from flask import Flask, request, jsonify, Blueprint
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv
from uuid import uuid4
from flask_jwt_extended import jwt_required, get_jwt_identity

load_dotenv()

router = Blueprint("feedback", __name__)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
feedback_collection = db["feedback"]

class FeedbackComment:
    def __init__(self, author: str, text: str, created_at: datetime):
        self.author = author
        self.text = text
        self.created_at = created_at

class FeedbackResponse:
    def __init__(self, response: str):
        self.response = response

class FeedbackCreate:
    def __init__(self, text: str, faculty_id: str, rating: int, student_id: str):
        self.text = text
        self.faculty_id = faculty_id
        self.rating = rating
        self.student_id = student_id

class FeedbackCommentCreate:
    def __init__(self, text: str):
        self.text = text

@router.route("/feedback", methods=["POST"])
def submit_feedback():
    try:
        data = request.get_json()
        print("📥 Received data:", data)
        
        student_id = data.get("student_id")
        print("🆔 student_id:", student_id)

        if not student_id or student_id == "undefined":
            return jsonify({"detail": "Invalid or missing student_id"}), 400

        try:
            student_obj_id = ObjectId(student_id)
        except Exception as e:
            return jsonify({"detail": f"Invalid student_id format: {e}"}), 400
        
        student = db.users.find_one({"_id": student_obj_id})
        if not student:
            return jsonify({"detail": "Student not found"}), 404
            
        if student["role"] != "Student":
            print(student["role"])
            return jsonify({"detail": "Only Students can submit feedback"}), 403

        feedback = FeedbackCreate(**data)
        
        feedback_dict = {
            "col_id": str(uuid4()),
            "Student_id": student_id,
            "Student_name": student["name"],  # Use actual name from database
            "faculty_id": feedback.faculty_id,
            "text": feedback.text,
            "rating": feedback.rating,
            "created_at": datetime.utcnow(),
            "comments": []
        }
        feedback_collection.insert_one(feedback_dict)
        return jsonify({"message": "Feedback submitted successfully"})
    
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/feedback", methods=["GET"])
def get_feedback():
    # Dummy user: Assume a faculty user
    user = {
        "name": "Anonymous Faculty",
        "role": "faculty"
    }

    if user["role"] != "faculty":
        return jsonify({"detail": "Only faculty can view feedback"}), 403

    try:
        feedbacks = list(feedback_collection.find().sort("created_at", -1))
        result = []
        for f in feedbacks:

            faculty = db.users.find_one({"_id": ObjectId(f["faculty_id"])})
            faculty_name = faculty["name"] if faculty else "Unknown Faculty"

            result.append({
                "_id": str(f["_id"]),
                "Student_name": f["Student_name"],
                "Faculty_name": faculty_name,
                "rating": f.get("rating", 0),
                "text": f["text"],
                "created_at": f["created_at"],
                "response": f.get("response"),
                "comments": f.get("comments", [])
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@router.route("/feedback/<fid>/comment", methods=["POST"])
def comment_feedback(fid):
    # Dummy user: Assume a faculty user
    user = {
        "name": "Anonymous Faculty",
        "role": "faculty"
    }

    if user["role"] != "faculty":
        return jsonify({"detail": "Only faculty can comment"}), 403

    try:
        data = request.get_json()
        comment = FeedbackCommentCreate(**data)
        
        result = feedback_collection.update_one(
            {"_id": ObjectId(fid)},
            {"$push": {"comments": {
                "author": user["name"],
                "text": comment.text,
                "created_at": datetime.utcnow()
            }}}
        )
        if result.modified_count == 0:
            return jsonify({"detail": "Feedback not found"}), 404
        return jsonify({"message": "Comment added successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/feedback/<fid>/response", methods=["POST"])
def respond_to_feedback(fid):
    # Dummy user: Assume a faculty user
    user = {
        "name": "Anonymous Faculty",
        "role": "faculty"
    }

    if user["role"] != "faculty":
        return jsonify({"detail": "Only faculty can respond"}), 403

    try:
        data = request.get_json()
        response = FeedbackResponse(**data)
        
        result = feedback_collection.update_one(
            {"_id": ObjectId(fid)},
            {"$set": {"response": response.response}}
        )
        if result.modified_count == 0:
            return jsonify({"detail": "Feedback not found"}), 404
        return jsonify({"message": "Response added successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
