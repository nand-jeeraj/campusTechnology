# forms.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# MongoDB Connection (same as assignments.py)
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
forms_collection = db["forms"]
submissions_collection = db["form_submissions"]

class FormField(BaseModel):
    id: str
    question: str
    type: str  # "short_answer", "paragraph", "multiple_choice", "checkboxes", "dropdown"
    options: Optional[List[str]] = None
    required: bool = False

class FormCreate(BaseModel):
    title: str
    description: Optional[str] = None
    fields: List[FormField]

class FormSubmission(BaseModel):
    form_id: str
    answers: dict
    timestamp: datetime = datetime.now()

# Add this endpoint to forms.py
@router.get("/forms")
async def get_forms():
    try:
        forms = list(forms_collection.find())
        
        # Convert ObjectId to string for each form and count submissions
        for form in forms:
            form["_id"] = str(form["_id"])
            submission_count = submissions_collection.count_documents({"form_id": str(form["_id"])})
            form["submission_count"] = submission_count
        
        return forms
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/forms")
async def create_form(form: FormCreate):
    try:
        form_data = form.dict()
        form_data["created_at"] = datetime.now()
        
        # Insert into MongoDB
        result = forms_collection.insert_one(form_data)
        
        return {
            "id": str(result.inserted_id),
            "message": "Form created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/forms/{form_id}")
async def get_form(form_id: str):
    try:
        if not ObjectId.is_valid(form_id):
            raise HTTPException(status_code=400, detail="Invalid form ID format")
            
        form = forms_collection.find_one({"_id": ObjectId(form_id)})
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
            
        # Convert ObjectId to string
        form["_id"] = str(form["_id"])
        return form
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/forms/{form_id}/submit")
async def submit_form(form_id: str, submission: FormSubmission):
    try:
        # Verify form exists
        if not forms_collection.find_one({"_id": ObjectId(form_id)}):
            raise HTTPException(status_code=404, detail="Form not found")
        
        submission_data = submission.dict()
        submission_data["form_id"] = form_id
        submission_data["submitted_at"] = datetime.now()
        
        # Insert into MongoDB
        result = submissions_collection.insert_one(submission_data)
        
        return {
            "id": str(result.inserted_id),
            "message": "Submission received"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/form-submissions")
async def get_form_submissions(form_id: Optional[str] = None):
    try:
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
        
        return submissions
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))