from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = Blueprint('forms', __name__)

# MongoDB Connection (same as assignments.py)
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
forms_collection = db["forms"]
submissions_collection = db["form_submissions"]

class FormField:
    def __init__(self, id: str, question: str, type: str, options=None, required=False):
        self.id = id
        self.question = question
        self.type = type  # "short_answer", "paragraph", "multiple_choice", "checkboxes", "dropdown"
        self.options = options or []
        self.required = required

class FormCreate:
    def __init__(self, title: str, description=None, fields=None):
        self.title = title
        self.description = description
        self.fields = fields or []

class FormSubmission:
    def __init__(self, form_id: str, answers: dict, timestamp=None):
        self.form_id = form_id
        self.answers = answers
        self.timestamp = timestamp or datetime.now()

@router.route("/forms", methods=["GET"])
def get_forms():
    try:
        forms = list(forms_collection.find())
        
        # Convert ObjectId to string for each form and count submissions
        for form in forms:
            form["_id"] = str(form["_id"])
            submission_count = submissions_collection.count_documents({"form_id": str(form["_id"])})
            form["submission_count"] = submission_count
        
        return jsonify(forms)
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/forms", methods=["POST"])
def create_form():
    try:
        data = request.get_json()
        form = FormCreate(
            title=data["title"],
            description=data.get("description"),
            fields=[FormField(**field) for field in data["fields"]]
        )
        
        form_data = {
            "title": form.title,
            "description": form.description,
            "fields": [field.__dict__ for field in form.fields],
            "created_at": datetime.now()
        }
        
        # Insert into MongoDB
        result = forms_collection.insert_one(form_data)
        
        return jsonify({
            "id": str(result.inserted_id),
            "message": "Form created successfully"
        })
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/forms/<form_id>", methods=["GET"])
def get_form(form_id):
    try:
        if not ObjectId.is_valid(form_id):
            return jsonify({"detail": "Invalid form ID format"}), 400
            
        form = forms_collection.find_one({"_id": ObjectId(form_id)})
        if not form:
            return jsonify({"detail": "Form not found"}), 404
            
        # Convert ObjectId to string
        form["_id"] = str(form["_id"])
        return jsonify(form)
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/forms/<form_id>/submit", methods=["POST"])
def submit_form(form_id):
    try:
        # Verify form exists
        if not forms_collection.find_one({"_id": ObjectId(form_id)}):
            return jsonify({"detail": "Form not found"}), 404
        
        data = request.get_json()
        submission = FormSubmission(
            form_id=form_id,
            answers=data["answers"],
            timestamp=data.get("timestamp", datetime.now())
        )
        
        submission_data = {
            "form_id": submission.form_id,
            "answers": submission.answers,
            "submitted_at": submission.timestamp
        }
        
        # Insert into MongoDB
        result = submissions_collection.insert_one(submission_data)
        
        return jsonify({
            "id": str(result.inserted_id),
            "message": "Submission received"
        })
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route("/form-submissions", methods=["GET"])
def get_form_submissions():
    try:
        form_id = request.args.get("form_id")
        query = {}
        if form_id:
            query["form_id"] = form_id
        
        submissions = list(submissions_collection.find(query))
        
        # Convert ObjectId to string for each submission
        for sub in submissions:
            sub["_id"] = str(sub["_id"])
            if "form_id" in sub:
                # Optionally populate form data
                form = forms_collection.find_one({"_id": ObjectId(sub["form_id"])})
                if form:
                    sub["form_title"] = form.get("title", "Untitled Form")
        
        return jsonify(submissions)
    except Exception as e:
        return jsonify({"detail": str(e)}), 400