from flask import Flask, request, jsonify, Blueprint
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv
from uuid import uuid4

load_dotenv()

router = Blueprint("ratings", __name__)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
ratings_collection = db["ratings"]
course_ratings_collection = db["course_ratings"]
users_collection = db["users"]

class RatingSubmit:
    def __init__(self, faculty_id: str, rating: int, comment: str = ""):
        self.faculty_id = faculty_id
        self.rating = rating
        self.comment = comment

class CourseRatingSubmit:
    def __init__(self, course_name: str, rating: int, comment: str = ""):
        self.course_name = course_name
        self.rating = rating
        self.comment = comment

def get_dummy_user():
    try:
        user_name = request.headers.get("x-user-name") or "Anonymous User"
        user_role = (request.headers.get("x-user-role") or "faculty").lower()
    except:
        user_name = "Anonymous User"
        user_role = "faculty"

    return {
        "_id": ObjectId(),
        "name": user_name,
        "role": user_role
    }

@router.route("/rate", methods=["POST"])
def submit_rating():
    data = request.get_json()
    rating_data = RatingSubmit(
        faculty_id=data["faculty_id"],
        rating=data["rating"],
        comment=data.get("comment", "")
    )
    
    user = get_dummy_user()
    if user["role"] != "Student":
        return jsonify({"detail": "Only Students can rate"}), 403

    try:
        rating_dict = {
            "col_id": str(uuid4()),
            "faculty_id": rating_data.faculty_id,
            "Student_id": str(user["_id"]),
            "rating": rating_data.rating,
            "comment": rating_data.comment,
            "created_at": datetime.utcnow()
        }
        ratings_collection.insert_one(rating_dict)
        return jsonify({"message": "Rating submitted successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/ratings/<faculty_id>", methods=["GET"])
def get_ratings(faculty_id):
    user = get_dummy_user()
    try:
        ratings = list(ratings_collection.find({"faculty_id": faculty_id}))
        result = []
        for r in ratings:
            Student = users_collection.find_one({"_id": ObjectId(r["Student_id"])})
            result.append({
                "Student_name": Student["name"] if Student else "Unknown",
                "rating": r["rating"],
                "comment": r.get("comment", ""),
                "created_at": r["created_at"].isoformat()
            })
        return jsonify({"ratings": result})
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@router.route("/course-ratings", methods=["POST"])
def submit_course_rating():
    data = request.get_json()
    course_rating = CourseRatingSubmit(
        course_name=data["course_name"],
        rating=data["rating"],
        comment=data.get("comment", "")
    )
    
    user = get_dummy_user()
    try:
        if not course_rating.course_name or not course_rating.rating:
            return jsonify({"detail": "Course name and rating are required"}), 400

        rating_dict = {
            "Student_id": str(user["_id"]),
            "course_name": course_rating.course_name,
            "rating": course_rating.rating,
            "comment": course_rating.comment,
            "created_at": datetime.utcnow()
        }
        course_ratings_collection.insert_one(rating_dict)
        return jsonify({"message": "Course rating submitted successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/faculty-view-course-ratings", methods=["GET"])
def view_all_course_ratings():
    user = get_dummy_user()
    if user["role"] != "faculty":
        return jsonify({"detail": "Only faculty can view all course ratings"}), 403
    try:
        ratings = list(course_ratings_collection.find())
        results = []
        for r in ratings:
            Student = users_collection.find_one({"_id": ObjectId(r["Student_id"])})
            results.append({
                "course_name": r.get("course_name", "Unknown Course"),
                "Student_name": Student["name"] if Student else "Unknown Student",
                "rating": r["rating"],
                "comment": r.get("comment", ""),
                "created_at": r["created_at"].isoformat() if "created_at" in r else ""
            })
        return jsonify(results)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@router.route("/faculty-course-ratings", methods=["GET"])
def get_faculty_course_ratings():
    user = get_dummy_user()
    if user["role"] != "faculty":
        return jsonify({"detail": "Only faculty can view course ratings"}), 403
    try:
        ratings = list(course_ratings_collection.find())
        result = [{
            "course_name": r.get("course_name", "N/A"),
            "Student_name": r.get("Student_name", "Unknown"),
            "rating": r.get("rating", 0),
            "comment": r.get("comment", ""),
            "created_at": r["created_at"].isoformat() if "created_at" in r else ""
        } for r in ratings]
        return jsonify(result)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500