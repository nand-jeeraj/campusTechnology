from bson import ObjectId
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
            self.role = user_data.get("role", "Student")
        else:
            self.name = ""
            self.email = ""
            self.role = "Student"

    def get_id(self):
        return self.id

    @property
    def is_faculty(self):
        return self.role == "faculty"

    @property
    def is_Student(self):
        return self.role == "Student"

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False
