import json
import numpy as np
import face_recognition
from extensions import mongo
from io import BytesIO
from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

def load_known_faces_from_db():
    encs, names = [], []
    for face in db.known_faces.find():
        try:
            encoding = np.array(json.loads(face["encoding"]))
            encs.append(encoding)
            names.append(face["name"])
        except Exception as e:
            print(f"Failed to load face for {face.get('name')}: {e}")
    return encs, names

def recognize_faces_from_bytes(image_bytes, known_encs, known_names):
    try:
        img = face_recognition.load_image_file(BytesIO(image_bytes))
        face_locations = face_recognition.face_locations(img)
        face_encs = face_recognition.face_encodings(img, face_locations)

        present, unknown = set(), 0
        for enc in face_encs:
            if not known_encs:
                unknown += 1
                continue

            distances = face_recognition.face_distance(known_encs, enc)
            best_match_index = np.argmin(distances)

            if distances[best_match_index] < 0.45:
                present.add(known_names[best_match_index])
            else:
                unknown += 1

        return list(present), unknown, len(face_encs)

    except Exception as e:
        print("Recognition failed:", e)
        return [], 0, 0
