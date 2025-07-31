from bson import ObjectId
from extensions import mongo
from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

class DummyUser:
    def __init__(self, user_id: str):
        self.id = str(user_id)

        user_data = db.users.find_one({"_id": ObjectId(user_id)})

        if user_data:
            self.name = user_data.get("name", "")
            self.email = user_data.get("email", "")
            self.role = user_data.get("role", "student")
        else:
            self.name = ""
            self.email = ""
            self.role = "student"

    def get_id(self):
        return self.id

    @property
    def is_faculty(self):
        return self.role == "faculty"

    @property
    def is_student(self):
        return self.role == "student"
