import os
import json
import io
from flask import Blueprint, request, jsonify
from flask_login import login_user, UserMixin
import face_recognition
import numpy as np
from PIL import Image
from pymongo import MongoClient
import logging
from flask_jwt_extended import create_access_token

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# MongoDB setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

router = Blueprint("face_login", __name__, url_prefix="/api")

class DummyUser(UserMixin):
    def __init__(self, user_id):
        self.id = str(user_id)

@router.route("/face-login", methods=["POST"])
def face_login():
    image_file = request.files.get('image')

    if not image_file:
        return jsonify({'error': 'No image provided'}), 400

    try:
        img = Image.open(image_file.stream).convert("RGB")  
        img_array = np.array(img)

        unknown_encodings = face_recognition.face_encodings(img_array)

        if not unknown_encodings:
            return jsonify({'error': 'No face found in image'}), 400

        unknown_encoding = unknown_encodings[0]

        users = list(db.users.find())  

        for user in users:
            encoding_data = user.get('facedata')
            if not encoding_data:
                continue

            try:
                # Load from JSON string or list
                if isinstance(encoding_data, str):
                    known_encoding = np.array(json.loads(encoding_data))
                else:
                    known_encoding = np.array(encoding_data)
            except Exception as e:
                continue

            if known_encoding is None or known_encoding.size == 0:
                continue

            matches = face_recognition.compare_faces([known_encoding], unknown_encoding)

            if matches[0]:
                user_obj = DummyUser(user['_id'])
                login_user(user_obj)
                return jsonify({
                    'message': 'Login successful',
                    'email': user['email'],
                    'name': user['name'],
                    "role": user["role"],
                    'token': str(user['_id']),
                    'id': str(user['_id'])
                }), 200

        return jsonify({'error': 'Face not recognized'}), 401

    except Exception as e:
        return jsonify({
            'error': 'Image processing failed',
            'details': str(e)
        }), 500
