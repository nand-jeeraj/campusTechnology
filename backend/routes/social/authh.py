from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from uuid import uuid4
from datetime import datetime, timedelta
import hashlib
import base64
import json
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

router = Flask(__name__)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
users_collection = db["users"]

# Constants
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Models (converted to regular Python classes)
class UserRegister:
    def __init__(self, name: str, email: str, password: str, role: str = "Student"):
        self.name = name
        self.email = email
        self.password = password
        self.role = role

class Token:
    def __init__(self, access_token: str, token_type: str, role: str, name: str):
        self.access_token = access_token
        self.token_type = token_type
        self.role = role
        self.name = name

# Helpers (unchanged except for HTTPException replacement)
def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    data.update({"exp": expire.isoformat()})
    json_data = json.dumps(data)
    token = base64.urlsafe_b64encode(json_data.encode()).decode()
    return token

def decode_token(token: str) -> dict:
    try:
        json_data = base64.urlsafe_b64decode(token.encode()).decode()
        return json.loads(json_data)
    except Exception:
        return None

# Routes
@router.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    user = UserRegister(
        name=data.get("name"),
        email=data.get("email"),
        password=data.get("password"),
        role=data.get("role", "Student")
    )

    if not user.email or not user.password or not user.name:
        return jsonify({"detail": "Missing required fields"}), 400

    if users_collection.find_one({"email": user.email}):
        return jsonify({"detail": "Email already exists"}), 409

    hashed_pw = get_password_hash(user.password)
    users_collection.insert_one({
        "col_id": str(uuid4()),
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "role": user.role,
    })
    return jsonify({"message": "Registered successfully"})

class LoginRequest:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password

@router.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    login_data = LoginRequest(email=data.get("email"), password=data.get("password"))
    
    user = users_collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        return jsonify({"detail": "Bad credentials"}), 401

    token = create_access_token(
        data={"sub": str(user["_id"]), "name": user["name"], "role": user["role"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return jsonify({
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"]
    })

if __name__ == "__main__":
    router.run(host="0.0.0.0", port=8000)