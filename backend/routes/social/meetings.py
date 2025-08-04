from flask import Flask, request, jsonify, Blueprint
from pymongo import MongoClient
from datetime import datetime
from uuid import uuid4
import os
from dotenv import load_dotenv

load_dotenv()

router = Blueprint("meetings", __name__)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
meetings_collection = db["meetings"]

class MeetingCreate:
    def __init__(self, title: str, time: str, link: str):
        self.title = title
        self.time = time
        self.link = link

@router.route("/meetings", methods=["POST"])
def create_meeting():
    # Dummy user used in place of actual authentication
    user = {
        "name": "Anonymous Faculty",
        "role": "faculty"
    }

    data = request.get_json()
    meeting = MeetingCreate(
        title=data['title'],
        time=data['time'],
        link=data['link']
    )

    meeting_data = {
        "col_id": str(uuid4()) or "col id",
        "title": meeting.title,
        "time": meeting.time,
        "link": meeting.link,
        "created_by": user.get("name", "Unknown"),
        "created_at": datetime.utcnow(),
    }

    try:
        meetings_collection.insert_one(meeting_data)
        return jsonify({"message": "Meeting created successfully"}), 201
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/meetings", methods=["GET"])
def list_meetings():
    try:
        meetings = meetings_collection.find().sort("time", 1)
        result = []
        for m in meetings:
            result.append({
                "title": m["title"],
                "time": m["time"],
                "link": m["link"],
                "created_by": m.get("created_by", "Unknown"),
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500