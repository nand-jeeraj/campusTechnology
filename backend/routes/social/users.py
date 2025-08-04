from flask import Blueprint, request, jsonify
from werkzeug.exceptions import HTTPException, Unauthorized
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

router = Blueprint("users", __name__)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
users_collection = db["users"]

def security():
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                auth_header = request.headers.get('Authorization')
                if not auth_header or not auth_header.startswith('Bearer '):
                    raise Unauthorized("Invalid token")
                token = auth_header.split(' ')[1]
                request.token = token  # attach token to request
                return f(*args, **kwargs)
            except Exception:
                raise Unauthorized("Invalid token")
        return wrapper
    return decorator

@router.route("/users", methods=["GET"])
@security()
def get_users_by_role():
    try:
        role = request.args.get('role')
        if not role:
            raise HTTPException(description="Role parameter is required")
        
        token = request.token  # Set by security decorator
        users = users_collection.find({"role": role})
        response = [{"_id": str(user["_id"]), "name": user["name"]} for user in users]
        return jsonify(response)
    except HTTPException as e:
        return jsonify({"detail": e.description}), e.code
    except Exception as e:
        return jsonify({"detail": str(e)}), 500
