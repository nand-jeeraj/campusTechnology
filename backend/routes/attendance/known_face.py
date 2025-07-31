import base64
import json
import traceback
from fastapi import APIRouter, UploadFile, Form, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from extensions import mongo
import face_recognition
from io import BytesIO
from dependencies import get_current_user  # Authentication dependency
from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

known_face_router = APIRouter(prefix="/api")

@known_face_router.post("/attendance_known-face")
async def known_face(
    name: str = Form(...),
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        image_bytes = await image.read()
        image_np = face_recognition.load_image_file(BytesIO(image_bytes))

        encodings = face_recognition.face_encodings(image_np)
        if not encodings:
            return JSONResponse(status_code=400, content={"error": "No face found"})

        # Convert encoding to JSON-storable format
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

        return {"success": True}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to add face")

router = known_face_router
