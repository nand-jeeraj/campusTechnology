from flask import Blueprint, jsonify, request
from extensions import mongo
from dependencies import get_current_user
from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient
import os
import traceback

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

dashboard_router = Blueprint("dashboard", __name__, url_prefix="/api")

@dashboard_router.route("/attendance_dashboard", methods=["GET"])
def dashboard():
    try:
        current_user = get_current_user()
        pipeline = [{"$group": {"_id": "$Student_name", "count": {"$sum": 1}}}]
        data = list(db.attendance.aggregate(pipeline))
        return jsonify(data)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@dashboard_router.route("/attendance_history", methods=["GET"])
def history():
    try:
        current_user = get_current_user()
        recs = list(db.attendance.find().sort("timestamp", -1))

        for i, r in enumerate(recs):
            r["_id"] = str(r["_id"])
            if isinstance(r.get("timestamp"), datetime):
                r["timestamp"] = r["timestamp"].isoformat()
        
        return jsonify(recs)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"detail": f"Internal server error: {str(e)}"}), 500

router = dashboard_router
