import os
import json
import numpy as np
import face_recognition
from PIL import Image
from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import JSONResponse
from extensions import mongo
import jwt
from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

router = APIRouter(prefix="/api", tags=["Face Login"])

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")

def create_token(user_id: str):
    return jwt.encode({"user_id": user_id}, SECRET_KEY, algorithm="HS256")

KNOWN_FACES_FOLDER = os.path.join("uploads", "known_faces")
USERS_FACE_FOLDER = os.path.join("uploads", "faces")


@router.post("/face-login")
async def face_login(image: UploadFile = Form(...)):
    if not image:
        return JSONResponse({'error': 'No image provided'}, status_code=400)

    try:
        img = Image.open(image.file).convert("RGB")
        img_array = np.array(img)

        unknown_encodings = face_recognition.face_encodings(img_array)
        if len(unknown_encodings) == 0:
            return JSONResponse({'error': 'No face found in image'}, status_code=400)

        unknown_encoding = unknown_encodings[0]
        users = list(db.users.find())

        for user in users:
            encoding_data = user.get('face_encoding')
            if not encoding_data:
                continue

            try:
                if isinstance(encoding_data, str):
                    known_encoding = np.array(json.loads(encoding_data))
                else:
                    known_encoding = np.array(encoding_data)
            except Exception:
                continue

            if known_encoding is None or known_encoding.size == 0:
                continue

            matches = face_recognition.compare_faces([known_encoding], unknown_encoding)

            if matches[0]:
                token = create_token(str(user["_id"]))
                return {
                    'message': 'Login successful',
                    'email': user['email'],
                    'name': user['name'],
                    'role': user.get('role', 'student'),
                    'token': token
                }

        return JSONResponse({'error': 'Face not recognized'}, status_code=401)

    except Exception as e:
        return JSONResponse({'error': str(e)}, status_code=500)
