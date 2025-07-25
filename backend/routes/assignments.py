from fastapi import APIRouter, HTTPException, Path, Body, Form, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import os
from gridfs import GridFS
from fastapi.responses import StreamingResponse
from io import BytesIO
import gridfs
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
assignments_collection = db["assignments"]
scheduled_assignments_collection = db["scheduled_assignments"]
submissions_collection = db["assignment_submissions"]

fs = GridFS(db)

class Question(BaseModel):
    id: Optional[str] = None
    type: str
    question: str
    options: Optional[List[str]] = None
    answer: str

class AssignmentBase(BaseModel):
    title: str
    questions: List[Question]

class AssignmentCreate(AssignmentBase):
    pass

class ScheduledAssignmentCreate(AssignmentBase):
    start_time: datetime
    end_time: datetime
    duration_minutes: int

@router.post("/create-assignment")
async def create_assignment(assignment: AssignmentCreate):
    try:
        assignment_data = assignment.dict()
        assignment_data["created_at"] = datetime.now()
        # Add IDs to each question if not provided
        for question in assignment_data["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
        result = assignments_collection.insert_one(assignment_data)
        return {
            "message": "Assignment created successfully",
            "id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-scheduled-assignment")
async def create_scheduled_assignment(assignment: ScheduledAssignmentCreate):
    try:
        assignment_data = assignment.dict()
        assignment_data["created_at"] = datetime.now()
        # Add IDs to each question if not provided
        for question in assignment_data["questions"]:
            if not question.get("id"):
                question["id"] = str(ObjectId())
        result = scheduled_assignments_collection.insert_one(assignment_data)
        return {
            "message": "Scheduled assignment created successfully",
            "id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/assignments/{assignment_id}")
async def delete_assignment(assignment_id: str):
    result = assignments_collection.delete_one({"_id": ObjectId(assignment_id)})
    if result.deleted_count == 1:
        return {"message": "Assignment deleted successfully"}
    raise HTTPException(status_code=404, detail="Assignment not found")

@router.delete("/scheduled-assignments/{assignment_id}")
async def delete_scheduled_assignment(assignment_id: str):
    result = scheduled_assignments_collection.delete_one({"_id": ObjectId(assignment_id)})
    if result.deleted_count == 1:
        return {"message": "Scheduled assignment deleted successfully"}
    raise HTTPException(status_code=404, detail="Scheduled assignment not found")

@router.put("/scheduled-assignments/{assignment_id}")
async def update_scheduled_assignment(
    assignment_id: str = Path(..., description="ID of the scheduled assignment"),
    data: dict = Body(...)
):
    update_fields = {}
    if "title" in data:
        update_fields["title"] = data["title"]
    if "start_time" in data:
        update_fields["start_time"] = datetime.fromisoformat(data["start_time"])
    if "end_time" in data:
        update_fields["end_time"] = datetime.fromisoformat(data["end_time"])
    if "duration_minutes" in data:
        update_fields["duration_minutes"] = data["duration_minutes"]

    result = scheduled_assignments_collection.update_one(
        {"_id": ObjectId(assignment_id)},
        {"$set": update_fields}
    )

    if result.modified_count == 1:
        return {"message": "Scheduled assignment updated successfully"}
    raise HTTPException(status_code=404, detail="Scheduled assignment not found")

@router.post("/upload-file-assignment")
async def upload_file_assignment(
    title: str = Form(...),
    totalMarks: str = Form("0"),
    file: UploadFile = File(...)
):
    try:
        # Store the file in GridFS
        file_id = fs.put(
            await file.read(),
            filename=file.filename,
            content_type=file.content_type,
            metadata={
                "original_name": file.filename,
                "uploaded_at": datetime.now(),
                "title": title,
                "totalMarks": totalMarks
            }
        )
        
        # Store metadata in assignments collection
        assignment_data = {
            "title": title,
            "totalMarks": totalMarks,
            "file_id": str(file_id),
            "isFileAssignment": True,
            "created_at": datetime.now()
        }
        
        result = assignments_collection.insert_one(assignment_data)
        return {
            "message": "File assignment uploaded successfully",
            "id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/download-file-assignment/{assignment_id}")
async def download_file_assignment(assignment_id: str):
    try:
        # Get the assignment
        assignment = assignments_collection.find_one({"_id": ObjectId(assignment_id)})
        if not assignment or not assignment.get("file_id"):
            raise HTTPException(status_code=404, detail="File assignment not found")
        
        # Get the file from GridFS
        file_id = ObjectId(assignment["file_id"])
        grid_out = fs.get(file_id)
        
        # Get the file data
        file_data = grid_out.read()
        
        # Get the original filename from metadata
        original_name = grid_out.metadata.get("original_name", "assignment_file")
        
        # Return the file as a download
        return StreamingResponse(
            BytesIO(file_data),
            media_type=grid_out.content_type,
            headers={
                "Content-Disposition": f"attachment; filename={original_name}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/download-submission-file/{file_id}")
async def download_submission_file(file_id: str):
    try:
        grid_out = fs.get(ObjectId(file_id))
        if not grid_out:
            raise HTTPException(status_code=404, detail="File not found")
            
        return StreamingResponse(
            grid_out,
            media_type=grid_out.content_type,
            headers={
                "Content-Disposition": f"attachment; filename={grid_out.filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/download-assignment-file/{file_id}")
async def download_assignment_file(file_id: str):
    try:
        grid_out = fs.get(ObjectId(file_id))
        if not grid_out:
            raise HTTPException(status_code=404, detail="File not found")
            
        return StreamingResponse(
            grid_out,
            media_type=grid_out.content_type,
            headers={
                "Content-Disposition": f"attachment; filename={grid_out.filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/submit-file-assignment/{assignment_id}")
async def submit_file_assignment(
    assignment_id: str,
    userId: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Store the submission in GridFS
        file_id = fs.put(
            await file.read(),
            filename=file.filename,
            content_type=file.content_type,
            metadata={
                "original_name": file.filename,
                "submitted_at": datetime.now(),
                "user_id": userId,
                "assignment_id": assignment_id
            }
        )

        # Fetch the assignment title
        assignment = assignments_collection.find_one({"_id": ObjectId(assignment_id)})
        assignment_title = assignment.get("title") if assignment else "Untitled"

        # Store submission metadata including title
        submission_data = {
            "assignment_id": assignment_id,
            "user_id": userId,
            "file_id": str(file_id),
            "submitted_at": datetime.now(),
            "status": "submitted",
            "title": assignment_title
        }

        submissions_collection.insert_one(submission_data)
        return {"message": "File submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list-submissions/{assignment_id}")
async def list_submissions(assignment_id: str):
    try:
        submissions = list(submissions_collection.find(
            {"assignment_id": assignment_id},
            {"file_id": 1, "user_id": 1, "submitted_at": 1}
        ))

        # Convert ObjectId to string for frontend
        for s in submissions:
            s["_id"] = str(s["_id"])

        # Get file info from GridFS for each submission
        for submission in submissions:
            grid_out = fs.get(ObjectId(submission["file_id"]))
            submission["filename"] = grid_out.filename
            submission["content_type"] = grid_out.content_type
            submission["upload_date"] = grid_out.upload_date
        
        return {"submissions": submissions}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/assignments/{assignment_id}")
async def get_assignment(assignment_id: str):
    try:
        assignment = assignments_collection.find_one({"_id": ObjectId(assignment_id)})
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Convert ObjectId to string and handle datetime serialization
        assignment["_id"] = str(assignment["_id"])
        if "created_at" in assignment and isinstance(assignment["created_at"], datetime):
            assignment["created_at"] = assignment["created_at"].isoformat()
        
        return assignment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
class GradeRequest(BaseModel):
    submission_id: str  # This will now be file_id
    assignment_id: str
    user_id: str
    marks: float

@router.post("/grade-assignment")
async def grade_assignment(request: GradeRequest):
    try:
        logger.info("Received grade request (by file_id): %s", request.dict())

        if not ObjectId.is_valid(request.submission_id):
            logger.warning("Invalid file ID (submission_id): %s", request.submission_id)
            raise HTTPException(status_code=400, detail="Invalid file ID")
        
        # Step 1: Update the score in the submission
        result = submissions_collection.update_one(
            {"file_id": request.submission_id},
            {"$set": {
                "score": request.marks,
                "graded_at": datetime.now(),
                "status": "graded"
            }}
        )

        if result.modified_count == 1:
            logger.info("Marks updated successfully for file_id: %s", request.submission_id)

            # ✅ Step 2: Fetch assignment using assignment_id from request
            assignment = assignments_collection.find_one({"_id": ObjectId(request.assignment_id)})
            if assignment and "totalMarks" in assignment:
                # ✅ Step 3: Add totalMarks to the submission
                submissions_collection.update_one(
                    {"file_id": request.submission_id},
                    {"$set": {"total_questions": assignment["totalMarks"]}}
                )
                logger.info("totalMarks added to submission: %s", assignment["totalMarks"])

            return {"message": "Marks and totalMarks updated successfully"}

        logger.warning("Submission with file_id not found or not modified: %s", request.submission_id)
        raise HTTPException(status_code=404, detail="Submission not found")

    except Exception as e:
        logger.error("Error occurred while grading assignment: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
