import base64
import traceback
from flask import Blueprint, request, jsonify
from PIL import Image
from io import BytesIO
from datetime import datetime
from bson import ObjectId
from extensions import mongo
from utils.face_utils import load_known_faces_from_db, recognize_faces_from_bytes
from dependencies import get_current_user
from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

upload_router = Blueprint("upload", __name__, url_prefix="/api")

@upload_router.route("/attendance_upload", methods=["POST"])
def upload():
    try:
        current_user = get_current_user()

        if 'image' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['image']
        image_bytes = file.read()

        known_encs, known_names = load_known_faces_from_db()

        present, unknown, total = recognize_faces_from_bytes(
            image_bytes, known_encs, known_names
        )

        Student_data = None

        for name in present:
            try:
                db.Students.update_one({"name": name}, {"$setOnInsert": {"name": name}}, upsert=True)
                Student_data = db.Students.find_one({"name": name})

                if not Student_data:
                    continue

                db.attendance.insert_one({
                    "Student_name": name,
                    "user": current_user.get("username", str(current_user.get("id"))),
                    "col_id": Student_data.get("col_id", "UNKNOWN"),
                    "program": Student_data.get("program", "UNKNOWN"),
                    "programcode": Student_data.get("programcode", "UNKNOWN"),
                    "course": Student_data.get("course", "UNKNOWN"),
                    "coursecode": Student_data.get("coursecode", "UNKNOWN"),
                    "faculty": Student_data.get("faculty", "UNKNOWN"),
                    "faculty_id": Student_data.get("faculty_id", "UNKNOWN"),
                    "year": datetime.utcnow().year,
                    "period": "Morning",
                    "Student_regno": Student_data.get("Student_regno", "UNKNOWN"),
                    "attendance": 1,
                    "timestamp": datetime.utcnow()
                })
            except Exception as Student_exc:
                traceback.print_exc()

        image_base64 = base64.b64encode(image_bytes).decode()

        db.uploaded_photos.insert_one({
            "col_id": Student_data.get("col_id", "UNKNOWN") if Student_data else "UNKNOWN",
            "uploaded_by": str(current_user.get("id")),
            "timestamp": datetime.utcnow(),
            "image_base64": image_base64,
            "present_Students": present,
            "unknown_faces": unknown,
            "total_faces": total
        })

        return jsonify({
            "present": present,
            "unknown": unknown,
            "total": total
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": "Upload failed",
            "details": str(e)
        }), 500

router = upload_router
