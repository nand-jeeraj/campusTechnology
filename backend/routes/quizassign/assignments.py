from flask import Flask, request, jsonify, Response, send_file, Blueprint
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from gridfs import GridFS
from io import BytesIO
import gridfs
import logging
from dotenv import load_dotenv
from typing import List

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = Blueprint("assignments", __name__)

CORS(router)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
assignments_collection = db["assignments"]
scheduled_assignments_collection = db["scheduled_assignments"]
submissions_collection = db["assignment_submissions"]

fs = GridFS(db)

class Question:
    def __init__(self, type: str, question: str, answer: str, id: str = None, options: List[str] = None):
        self.id = id
        self.type = type
        self.question = question
        self.options = options
        self.answer = answer

    def dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "question": self.question,
            "options": self.options,
            "answer": self.answer
        }

@router.route("/create-assignment", methods=["POST"])
def create_assignment():
    try:
        data = request.get_json()
        assignment_data = {
            "title": data["title"],
            "questions": [q if isinstance(q, dict) else q.dict() for q in data["questions"]],
            "created_at": datetime.now()
        }
        # Add IDs to each question if not provided
        for question in assignment_data["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
        result = assignments_collection.insert_one(assignment_data)
        return jsonify({
            "message": "Assignment created successfully",
            "id": str(result.inserted_id)
        })
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/create-scheduled-assignment", methods=["POST"])
def create_scheduled_assignment():
    try:
        data = request.get_json()
        assignment_data = {
            "title": data["title"],
            "questions": [q if isinstance(q, dict) else q.dict() for q in data["questions"]],
            "start_time": datetime.fromisoformat(data["start_time"]),
            "end_time": datetime.fromisoformat(data["end_time"]),
            "duration_minutes": data["duration_minutes"],
            "created_at": datetime.now()
        }
        # Add IDs to each question if not provided
        for question in assignment_data["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
        result = scheduled_assignments_collection.insert_one(assignment_data)
        return jsonify({
            "message": "Scheduled assignment created successfully",
            "id": str(result.inserted_id)
        })
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/assignments/<assignment_id>", methods=["DELETE"])
def delete_assignment(assignment_id):
    result = assignments_collection.delete_one({"_id": ObjectId(assignment_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Assignment deleted successfully"})
    return jsonify({"detail": "Assignment not found"}), 404

@router.route("/scheduled-assignments/<assignment_id>", methods=["DELETE"])
def delete_scheduled_assignment(assignment_id):
    result = scheduled_assignments_collection.delete_one({"_id": ObjectId(assignment_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Scheduled assignment deleted successfully"})
    return jsonify({"detail": "Scheduled assignment not found"}), 404

@router.route("/scheduled-assignments/<assignment_id>", methods=["PUT"])
def update_scheduled_assignment(assignment_id):
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

        result = scheduled_assignments_collection.update_one(
            {"_id": ObjectId(assignment_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 1:
            return jsonify({"message": "Scheduled assignment updated successfully"})
        return jsonify({"detail": "Scheduled assignment not found"}), 404
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/upload-file-assignment", methods=["POST"])
def upload_file_assignment():
    try:
        title = request.form.get("title")
        totalMarks = request.form.get("totalMarks", "0")
        file = request.files.get("file")
        
        if not file:
            return jsonify({"detail": "No file provided"}), 400
            
        file_id = fs.put(
            file.read(),
            filename=file.filename,
            content_type=file.content_type,
            metadata={
                "original_name": file.filename,
                "uploaded_at": datetime.now(),
                "title": title,
                "totalMarks": totalMarks
            }
        )
        
        assignment_data = {
            "title": title,
            "totalMarks": totalMarks,
            "file_id": str(file_id),
            "isFileAssignment": True,
            "created_at": datetime.now()
        }
        
        result = assignments_collection.insert_one(assignment_data)
        return jsonify({
            "message": "File assignment uploaded successfully",
            "id": str(result.inserted_id)
        })
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/download-file-assignment/<assignment_id>", methods=["GET"])
def download_file_assignment(assignment_id):
    try:
        assignment = assignments_collection.find_one({"_id": ObjectId(assignment_id)})
        if not assignment or not assignment.get("file_id"):
            return jsonify({"detail": "File assignment not found"}), 404
        
        file_id = ObjectId(assignment["file_id"])
        grid_out = fs.get(file_id)
        
        file_data = grid_out.read()
        original_name = grid_out.metadata.get("original_name", "assignment_file")
        
        return send_file(
            BytesIO(file_data),
            mimetype=grid_out.content_type,
            as_attachment=True,
            download_name=original_name
        )
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/download-submission-file/<file_id>", methods=["GET"])
def download_submission_file(file_id):
    try:
        grid_out = fs.get(ObjectId(file_id))
        if not grid_out:
            return jsonify({"detail": "File not found"}), 404
            
        return send_file(
            grid_out,
            mimetype=grid_out.content_type,
            as_attachment=True,
            download_name=grid_out.filename
        )
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/download-assignment-file/<file_id>", methods=["GET"])
def download_assignment_file(file_id):
    try:
        grid_out = fs.get(ObjectId(file_id))
        if not grid_out:
            return jsonify({"detail": "File not found"}), 404
            
        return send_file(
            grid_out,
            mimetype=grid_out.content_type,
            as_attachment=True,
            download_name=grid_out.filename
        )
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    
@router.route("/submit-file-assignment/<assignment_id>", methods=["POST"])
def submit_file_assignment(assignment_id):
    try:
        userId = request.form.get("userId")
        file = request.files.get("file")
        
        if not file:
            return jsonify({"detail": "No file provided"}), 400
            
        file_id = fs.put(
            file.read(),
            filename=file.filename,
            content_type=file.content_type,
            metadata={
                "original_name": file.filename,
                "submitted_at": datetime.now(),
                "user_id": userId,
                "assignment_id": assignment_id
            }
        )

        assignment = assignments_collection.find_one({"_id": ObjectId(assignment_id)})
        assignment_title = assignment.get("title") if assignment else "Untitled"

        submission_data = {
            "assignment_id": assignment_id,
            "user_id": userId,
            "file_id": str(file_id),
            "submitted_at": datetime.now(),
            "status": "submitted",
            "title": assignment_title
        }

        submissions_collection.insert_one(submission_data)
        return jsonify({"message": "File submitted successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/list-submissions/<assignment_id>", methods=["GET"])
def list_submissions(assignment_id):
    try:
        submissions = list(submissions_collection.find(
            {"assignment_id": assignment_id},
            {"file_id": 1, "user_id": 1, "submitted_at": 1}
        ))

        for s in submissions:
            s["_id"] = str(s["_id"])

        for submission in submissions:
            grid_out = fs.get(ObjectId(submission["file_id"]))
            submission["filename"] = grid_out.filename
            submission["content_type"] = grid_out.content_type
            submission["upload_date"] = grid_out.upload_date
        
        return jsonify({"submissions": submissions})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    
@router.route("/assignments/<assignment_id>", methods=["GET"])
def get_assignment(assignment_id):
    try:
        assignment = assignments_collection.find_one({"_id": ObjectId(assignment_id)})
        if not assignment:
            return jsonify({"detail": "Assignment not found"}), 404
        
        assignment["_id"] = str(assignment["_id"])
        if "created_at" in assignment and isinstance(assignment["created_at"], datetime):
            assignment["created_at"] = assignment["created_at"].isoformat()
        
        return jsonify(assignment)
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    
@router.route("/grade-assignment", methods=["POST"])
def grade_assignment():
    try:
        data = request.get_json()
        submission_id = data.get("submission_id")
        assignment_id = data.get("assignment_id")
        user_id = data.get("user_id")
        marks = data.get("marks")
        
        logger.info("Received grade request (by file_id): %s", data)

        if not ObjectId.is_valid(submission_id):
            logger.warning("Invalid file ID (submission_id): %s", submission_id)
            return jsonify({"detail": "Invalid file ID"}), 400
        
        result = submissions_collection.update_one(
            {"file_id": submission_id},
            {"$set": {
                "score": marks,
                "graded_at": datetime.now(),
                "status": "graded"
            }}
        )

        if result.modified_count == 1:
            logger.info("Marks updated successfully for file_id: %s", submission_id)

            assignment = assignments_collection.find_one({"_id": ObjectId(assignment_id)})
            if assignment and "totalMarks" in assignment:
                submissions_collection.update_one(
                    {"file_id": submission_id},
                    {"$set": {"total_questions": assignment["totalMarks"]}}
                )
                logger.info("totalMarks added to submission: %s", assignment["totalMarks"])

            return jsonify({"message": "Marks and totalMarks updated successfully"})

        logger.warning("Submission with file_id not found or not modified: %s", submission_id)
        return jsonify({"detail": "Submission not found"}), 404

    except Exception as e:
        logger.error("Error occurred while grading assignment: %s", str(e))
        return jsonify({"detail": str(e)}), 400
