import base64
import traceback
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from fastapi.responses import JSONResponse
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

upload_router = APIRouter(prefix="/api")

@upload_router.post("/attendance_upload")
async def upload(
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):

    try:
        # Read image bytes
        image_bytes = await image.read()

        # Load known face encodings and names
        known_encs, known_names = load_known_faces_from_db()

        # Face recognition
        present, unknown, total = recognize_faces_from_bytes(
            image_bytes, known_encs, known_names
        )

        student_data = None

        for name in present:
            try:
                db.students.update_one({"name": name}, {"$setOnInsert": {"name": name}}, upsert=True)
                student_data = db.students.find_one({"name": name})

                if not student_data:
                    continue

                db.attendance.insert_one({
                    "student_name": name,
                    "user": current_user.get("username", str(current_user.get("id"))),
                    "col_id": student_data.get("col_id", "UNKNOWN"),
                    "program": student_data.get("program", "UNKNOWN"),
                    "programcode": student_data.get("programcode", "UNKNOWN"),
                    "course": student_data.get("course", "UNKNOWN"),
                    "coursecode": student_data.get("coursecode", "UNKNOWN"),
                    "faculty": student_data.get("faculty", "UNKNOWN"),
                    "faculty_id": student_data.get("faculty_id", "UNKNOWN"),
                    "year": datetime.utcnow().year,
                    "period": "Morning",
                    "student_regno": student_data.get("student_regno", "UNKNOWN"),
                    "attendance": 1,
                    "timestamp": datetime.utcnow()
                })
            except Exception as student_exc:
                traceback.print_exc()

        # Convert image to base64
        image_base64 = base64.b64encode(image_bytes).decode()

        db.uploaded_photos.insert_one({
            "col_id": student_data.get("col_id", "UNKNOWN") if student_data else "UNKNOWN",
            "uploaded_by": str(current_user.get("id")),
            "timestamp": datetime.utcnow(),
            "image_base64": image_base64,
            "present_students": present,
            "unknown_faces": unknown,
            "total_faces": total
        })

        return JSONResponse(content={
            "present": present,
            "unknown": unknown,
            "total": total
        })

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Upload failed",
                "details": str(e)
            }
        )

router = upload_router
