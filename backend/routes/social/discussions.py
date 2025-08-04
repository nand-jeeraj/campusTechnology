from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

router = Blueprint("discussions", __name__)

CORS(router, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "x-user-name", "x-user-role"],
    "supports_credentials": True
}})

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
discussions_collection = db["discussions"]
users_collection = db["users"]

class Comment:
    def __init__(self, comment_id: str, author_id: str, author: str, author_role: str, text: str, created_at: datetime):
        self.comment_id = comment_id
        self.author_id = author_id
        self.author = author
        self.author_role = author_role
        self.text = text
        self.created_at = created_at

class Discussion:
    def __init__(self, _id: str = None, user_id: str = None, author_name: str = None, author_role: str = None,
                 title: str = None, body: str = None, created_at: datetime = None, comments: list = None):
        self._id = _id
        self.user_id = user_id
        self.author_name = author_name
        self.author_role = author_role
        self.title = title
        self.body = body
        self.created_at = created_at
        self.comments = comments or []

def get_dummy_user():
    try:
        user_name = request.headers.get("x-user-name") or "Anonymous User"
        user_role = request.headers.get("x-user-role") or "Student"
    except:
        user_name = "Anonymous User"
        user_role = "Student"

    return {
        "_id": ObjectId(),
        "name": user_name,
        "role": user_role
    }

@router.route("/discussions", methods=["GET"])
def get_discussions():
    try:
        discussions = list(discussions_collection.find().sort("created_at", -1))
        for d in discussions:
            d["_id"] = str(d["_id"])
            d["body"] = d.get("body") or d.get("content") or ""
            for c in d.get("comments", []):
                c["created_at"] = c["created_at"].isoformat()
        return jsonify(discussions)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@router.route("/discussions", methods=["POST"])
def post_discussion():
    user = get_dummy_user()
    try:
        data = request.get_json()
        discussion_dict = {
            "user_id": str(user["_id"]),
            "author_name": user["name"],
            "author_role": user["role"],
            "title": data["title"],
            "body": data["body"],
            "created_at": datetime.utcnow(),
            "comments": []
        }
        discussions_collection.insert_one(discussion_dict)
        return jsonify({"message": "Discussion posted successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/discussions/<discussion_id>/comment", methods=["POST"])
def add_comment(discussion_id):
    user = get_dummy_user()
    try:
        data = request.get_json()
        if not data.get("text"):
            return jsonify({"detail": "Comment text required"}), 400

        new_comment = {
            "comment_id": str(ObjectId()),
            "author_id": str(user["_id"]),
            "author": user["name"],
            "author_role": user["role"],
            "text": data["text"],
            "created_at": datetime.utcnow()
        }

        result = discussions_collection.update_one(
            {"_id": ObjectId(discussion_id)},
            {"$push": {"comments": new_comment}}
        )

        if result.modified_count == 0:
            return jsonify({"detail": "Discussion not found"}), 404
        return jsonify({"message": "Comment added successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/discussions/<discussion_id>/comment/<comment_id>", methods=["DELETE"])
def delete_comment(discussion_id, comment_id):
    user = get_dummy_user()
    try:
        if user["role"] != "faculty":
            return jsonify({"detail": "Only faculty can delete comments"}), 403

        result = discussions_collection.update_one(
            {"_id": ObjectId(discussion_id)},
            {"$pull": {"comments": {"comment_id": comment_id}}}
        )

        if result.modified_count == 0:
            return jsonify({"detail": "Comment not found or already deleted"}), 404
        return jsonify({"message": "Comment deleted successfully"})
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
