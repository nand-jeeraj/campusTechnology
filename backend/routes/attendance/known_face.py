import base64
import json
import traceback
from flask import Blueprint, request, jsonify
from extensions import mongo
import face_recognition
from io import BytesIO
from dependencies import get_current_user  # Authentication dependency
from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

router = Blueprint("known_face", __name__, url_prefix="/api")

@router.route("/attendance_known-face", methods=["POST"])
def known_face():
    try:
        current_user = get_current_user()  # same as Depends in FastAPI

        name = request.form.get("name")
        image = request.files.get("image")

        if not name or not image:
            return jsonify({"error": "Missing name or image"}), 400

        image_bytes = image.read()
        image_np = face_recognition.load_image_file(BytesIO(image_bytes))

        encodings = face_recognition.face_encodings(image_np)
        if not encodings:
            return jsonify({"error": "No face found"}), 400

        encoding_str = json.dumps(encodings[0].tolist())
        encoded_img = base64.b64encode(image_bytes).decode()

        db.known_faces.update_one(
            {"name": name},
            {"$set": {
                "encoding": encoding_str,
                "image_base64": encoded_img
            }},
            upsert=True
        )

        return jsonify({"success": True})

    except Exception:
        traceback.print_exc()
        return jsonify({"detail": "Failed to add face"}), 500
