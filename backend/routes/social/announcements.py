from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

router = Blueprint('announcements', __name__)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
announcements_collection = db["announcements"]

class AnnouncementCreate:
    def __init__(self, title: str, message: str):
        self.title = title
        self.message = message

class Announcement:
    def __init__(self, _id=None, col_id: str = None, title: str = None, 
                 message: str = None, created_by: str = None, created_at: datetime = None):
        self._id = _id
        self.col_id = col_id
        self.title = title
        self.message = message
        self.created_by = created_by
        self.created_at = created_at

@router.route("/announcements", methods=["POST"])
def create_announcement():
    try:
        data = request.get_json()
        announcement = AnnouncementCreate(title=data['title'], message=data['message'])
        
        # Dummy user for simulation (since auth removed)
        user = {
            "name": request.headers.get("x-user-name", "Anonymous User"),
            "role": request.headers.get("x-user-role", "faculty")
        }

        announcement_dict = {
            "col_id": str(uuid4()),
            "title": announcement.title,
            "message": announcement.message,
            "created_by": user["name"],
            "created_at": datetime.utcnow()
        }
        result = announcements_collection.insert_one(announcement_dict)
        return jsonify({"message": "Announcement created successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/announcements", methods=["GET"])
def get_announcements():
    try:
        announcements = list(announcements_collection.find().sort("created_at", -1))
        result = []
        for a in announcements:
            result.append({
                "_id": str(a["_id"]),
                "title": a["title"],
                "message": a["message"],
                "created_by": a.get("created_by", "Unknown"),
                "created_at": a.get("created_at")
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500