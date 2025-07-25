from fastapi import APIRouter, HTTPException
from database import submission_collection, assignment_submission_collection
from pymongo import MongoClient
from datetime import datetime
import logging
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
scheduled_quiz_collection = db["scheduled_quizzes"]
quizzes_collection = db["quizzes"]
submissions_collection = db["submissions"]
assignment_submissions_collection = db["assignment_submissions"]

@router.get("/submissions")
def get_quiz_submissions():
    data = list(submission_collection.find({}, {"_id": 0}))
    return data

@router.get("/assignment-submissions")
def get_assignment_submissions():
    data = list(assignment_submission_collection.find({}, {"_id": 0}))
    return data

@router.get("/all-submissions")
def all_submissions():
    submissions = list(submission_collection.find())
    for s in submissions:
        s["_id"] = str(s["_id"])
    return submissions

# Add this to submission.py

@router.get("/leaderboard")
async def get_leaderboard():
    try:
        logger.info("Fetching leaderboard data")
        
        # Aggregate quiz scores by user
        quiz_pipeline = [
            {
                "$group": {
                    "_id": "$user_id",
                    "total_quiz_score": { "$sum": "$score" },
                    "quiz_submissions": { "$sum": 1 }
                }
            },
            {
                "$project": {
                    "user_id": "$_id",
                    "total_quiz_score": 1,
                    "_id": 0
                }
            }
        ]
        
        quiz_scores = list(submissions_collection.aggregate(quiz_pipeline))
        
        # Aggregate assignment scores by user
        assignment_pipeline = [
            {
                "$group": {
                    "_id": "$user_id",
                    "total_assignment_score": { "$sum": "$score" },
                    "assignment_submissions": { "$sum": 1 }
                }
            },
            {
                "$project": {
                    "user_id": "$_id",
                    "total_assignment_score": 1,
                    "_id": 0
                }
            }
        ]
        
        assignment_scores = list(assignment_submissions_collection.aggregate(assignment_pipeline))
        
        # Combine results
        leaderboard = {}
        
        # Process quiz scores
        for score in quiz_scores:
            user_id = score["user_id"]
            if user_id not in leaderboard:
                leaderboard[user_id] = {
                    "user_id": user_id,
                    "total_quiz_score": score["total_quiz_score"],
                    "total_assignment_score": 0,
                    "combined_score": score["total_quiz_score"]
                }
            else:
                leaderboard[user_id]["total_quiz_score"] = score["total_quiz_score"]
                leaderboard[user_id]["combined_score"] += score["total_quiz_score"]
        
        # Process assignment scores
        for score in assignment_scores:
            user_id = score["user_id"]
            if user_id not in leaderboard:
                leaderboard[user_id] = {
                    "user_id": user_id,
                    "total_quiz_score": 0,
                    "total_assignment_score": score["total_assignment_score"],
                    "combined_score": score["total_assignment_score"]
                }
            else:
                leaderboard[user_id]["total_assignment_score"] = score["total_assignment_score"]
                leaderboard[user_id]["combined_score"] += score["total_assignment_score"]
        
        # Convert to list and sort by combined score (descending)
        leaderboard_list = sorted(leaderboard.values(), key=lambda x: x["combined_score"], reverse=True)
        
        return leaderboard_list
        
    except Exception as e:
        logger.error(f"Error generating leaderboard: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)
            }
        )