from flask import Blueprint, jsonify, request
from pymongo import MongoClient
import os
from flask_login import current_user
from bson import ObjectId
from datetime import datetime
import re
import jwt

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

router = Blueprint("profile", __name__, url_prefix="/api")


@router.route("/user-profile", methods=["GET", "OPTIONS"])
def get_user_profile():
    print("📥 Received /user-profile request")
    print(f"📬 All headers: {dict(request.headers)}")

    if request.method == "OPTIONS":
        print("🛑 OPTIONS request received – returning empty response")
        return jsonify({}), 200

    user_id = request.args.get('user_id')
    email = request.args.get('email')
    name = request.args.get('name')

    if user_id:
        try:
            query_filter = {"_id": ObjectId(user_id)}
            print(f"🔑 Using user_id: {user_id}")
        except Exception as e:
            print(f"⚠️ Invalid user_id format: {e}")
            query_filter = None
    elif email and name:
        query_filter = {"email": email, "name": name}
        print(f"📧 Using fallback email + name: {query_filter}")
    else:
        print("⛔ No valid user_id or fallback provided")
        return jsonify({"error": "user_id or (email + name) header required"}), 401
    
    if query_filter is None:
        return jsonify({"error": "Invalid user_id or fallback"}), 400
    
    try:
        projection = {
            "name": 1,
            "email": 1,
            "role": 1,
            "createdAt": 1,
            "courses": 1,
            "_id": 0
        }

        print(f"📡 Querying DB with filter: {query_filter}")
        user = db.users.find_one(query_filter, projection)

        if not user:
            print(f"❌ No user found with: {query_filter}")
            return jsonify({"error": "User not found"}), 404

        user['image'] = f"https://ui-avatars.com/api/?name={user['name'].replace(' ', '+')}&background=random"
        print("✅ User data retrieved successfully")

        return jsonify(user), 200

    except Exception as e:
        print(f"💥 Exception occurred while fetching user profile: {e}")
        return jsonify({"error": str(e)}), 500


@router.route("/update-profile", methods=["POST"])
def update_profile():
    # This would handle profile updates without file storage
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    try:
        update_data = {}
        
        if 'name' in data:
            update_data['name'] = data['name']
        
        if 'email' in data:
            # Validate email format
            if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
                return jsonify({"error": "Invalid email format"}), 400
            update_data['email'] = data['email']
        
        if 'courses' in data:
            update_data['courses'] = data['courses']

        if update_data:
            result = db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                return jsonify({"message": "No changes made"}), 200

        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        print(f"💥 Exception occurred while updating profile: {e}")
        return jsonify({"error": str(e)}), 500
