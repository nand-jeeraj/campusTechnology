from fastapi import APIRouter, Request, Depends, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from extensions import mongo
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image
import face_recognition
import numpy as np
import jwt
import os
import re
from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

router = APIRouter(prefix="/api", tags=["Auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
security = HTTPBearer()

# ✅ Helper functions
def is_valid_email(email: str):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_password(password: str):
    return len(password) >= 6  

def create_token(user_id: str):
    return jwt.encode(
        {"user_id": user_id, "exp": datetime.utcnow() + timedelta(hours=24)},
        SECRET_KEY,
        algorithm="HS256"
    )

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

# ✅ Register
@router.post("/register")
async def register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    image: UploadFile = Form(...)
):
    if db.users.find_one({'email': email}):
        return JSONResponse({"error": "User already exists"}, status_code=400)

    # Process image and get face encoding
    try:
        img = Image.open(image.file).convert('RGB')
        img_array = np.array(img)
        encodings = face_recognition.face_encodings(img_array)
        if len(encodings) == 0:
            return JSONResponse({"error": "No face detected in the image"}, status_code=400)
        face_encoding = encodings[0].tolist()
    except Exception as e:
        return JSONResponse({"error": f"Image processing failed: {str(e)}"}, status_code=500)

    hashed_password = generate_password_hash(password)
    db.users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role,
        "face_encoding": face_encoding
    })

    return {"message": "User registered successfully"}

# ✅ Login
@router.post("/login")
async def login(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return JSONResponse({"success": False, "message": "Email and password required"}, status_code=400)

    user = db.users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return JSONResponse({"success": False, "message": "Invalid credentials"}, status_code=401)

    token = create_token(str(user["_id"]))
    return {
        "success": True,
        "message": "Login successful",
        "role": user.get("role", "student"),
        "token": token,
        "name": user.get("name", "")
    }

# ✅ Check Auth
@router.get("/check-auth")
def check_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decode_token(credentials.credentials)
        return {"status": "ok"}
    except jwt.ExpiredSignatureError:
        return JSONResponse({"status": "unauthorized"}, status_code=401)
    except jwt.InvalidTokenError:
        return JSONResponse({"status": "unauthorized"}, status_code=401)

# ✅ Logout (Client just clears token)
@router.post("/logout")
def logout():
    return {"success": True}
