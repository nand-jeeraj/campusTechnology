from flask import Blueprint, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import logging
from bson import ObjectId
import os

load_dotenv()

router = Blueprint('Faculty_view', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
scheduled_quiz_collection = db["scheduled_quizzes"]
quizzes_collection = db["quizzes"]
submissions_collection = db["submissions"]
assignment_submissions_collection = db["assignment_submissions"]

submission_collection = submissions_collection
assignment_submission_collection = assignment_submissions_collection

@router.route("/submissions", methods=["GET"])
def get_quiz_submissions():
    # Get all quiz submissions with user names
    submissions = list(submission_collection.find({}))
    
    # Get all users first for efficient lookup
    users = {str(user["_id"]): user["name"] for user in db.users.find({}, {"_id": 1, "name": 1})}
    
    # Enhance submissions with user names
    for submission in submissions:
        submission["_id"] = str(submission["_id"])
        submission["user_name"] = users.get(submission["user_id"], "Unknown")
    
    return jsonify(submissions)

@router.route("/assignment-submissions", methods=["GET"])
def get_assignment_submissions():
    # Get all assignment submissions with user names
    submissions = list(assignment_submission_collection.find({}))
    
    # Get all users first for efficient lookup
    users = {str(user["_id"]): user["name"] for user in db.users.find({}, {"_id": 1, "name": 1})}
    
    # Enhance submissions with user names
    for submission in submissions:
        submission["_id"] = str(submission["_id"])
        # Handle both string and ObjectId user_id formats
        user_id = str(submission["user_id"]) if isinstance(submission["user_id"], ObjectId) else submission["user_id"]
        submission["user_name"] = users.get(user_id, "Unknown")
    
    return jsonify(submissions)

@router.route("/all-submissions", methods=["GET"])
def all_submissions():
    submissions = list(submission_collection.find())
    for s in submissions:
        s["_id"] = str(s["_id"])
    return jsonify(submissions)

@router.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    try:
        logger.info("Fetching leaderboard data")
        
        # Get all users first with both string and ObjectId formats
        users = list(db.users.find({}, {"_id": 1, "name": 1}))
        user_map = {}
        for user in users:
            # Map both string and ObjectId formats to handle all cases
            user_map[str(user["_id"])] = user["name"]
            user_map[user["_id"]] = user["name"]  # Also map the ObjectId directly
        
        # Get all unique user IDs from submissions (both string and ObjectId formats)
        all_submission_user_ids = set()
        
        # Get from quiz submissions
        quiz_user_ids = submissions_collection.distinct("user_id")
        for uid in quiz_user_ids:
            all_submission_user_ids.add(str(uid))
            if isinstance(uid, ObjectId):
                all_submission_user_ids.add(uid)
        
        # Get from assignment submissions
        assignment_user_ids = assignment_submissions_collection.distinct("user_id")
        for uid in assignment_user_ids:
            all_submission_user_ids.add(str(uid))
            if isinstance(uid, ObjectId):
                all_submission_user_ids.add(uid)
        
        # Find missing users
        missing_user_ids = [uid for uid in all_submission_user_ids 
                          if str(uid) not in user_map and uid not in user_map]
        
        if missing_user_ids:
            logger.warning(f"Found {len(missing_user_ids)} user IDs in submissions with no matching user record")
            logger.warning(f"Missing user IDs: {missing_user_ids}")
            
            # Try to find these users by converting string IDs to ObjectId
            try:
                for uid in missing_user_ids[:]:  # Iterate over a copy
                    if isinstance(uid, str) and ObjectId.is_valid(uid):
                        user = db.users.find_one({"_id": ObjectId(uid)}, {"name": 1})
                        if user:
                            user_map[uid] = user["name"]
                            user_map[ObjectId(uid)] = user["name"]
                            missing_user_ids.remove(uid)
                            logger.info(f"Found user by converting string ID to ObjectId: {uid}")
            except Exception as e:
                logger.error(f"Error while trying to find users by ID conversion: {str(e)}")
        
        # Main aggregation pipeline with proper ID handling
        def get_scores(collection):
            pipeline = [
                {
                    "$group": {
                        "_id": "$user_id",
                        "total_score": {"$sum": "$score"},
                        "count": {"$sum": 1}
                    }
                }
            ]
            results = list(collection.aggregate(pipeline))
            
            processed = []
            for result in results:
                user_id = result["_id"]
                # Handle both string and ObjectId formats
                display_id = str(user_id) if isinstance(user_id, ObjectId) else user_id
                processed.append({
                    "user_id": display_id,
                    "original_id": user_id,  # Keep original for lookup
                    "total_score": result["total_score"]
                })
            return processed
        
        # Get scores
        quiz_scores = get_scores(submissions_collection)
        assignment_scores = get_scores(assignment_submissions_collection)
        
        # Combine scores
        leaderboard = {}
        
        def add_scores(scores, score_type):
            for score in scores:
                user_id = score["user_id"]
                original_id = score["original_id"]
                
                # Get name with fallback to original ID lookup
                name = user_map.get(str(original_id)) or user_map.get(original_id) or f"Unknown (ID: {user_id})"
                
                if user_id not in leaderboard:
                    leaderboard[user_id] = {
                        "user_id": user_id,
                        "student_name": name,
                        "total_quiz_score": 0,
                        "total_assignment_score": 0,
                        "combined_score": 0
                    }
                
                if score_type == "quiz":
                    leaderboard[user_id]["total_quiz_score"] = score["total_score"]
                else:
                    leaderboard[user_id]["total_assignment_score"] = score["total_score"]
                
                leaderboard[user_id]["combined_score"] += score["total_score"]
        
        add_scores(quiz_scores, "quiz")
        add_scores(assignment_scores, "assignment")
        
        # Final sorted list
        leaderboard_list = sorted(
            leaderboard.values(),
            key=lambda x: x["combined_score"],
            reverse=True
        )
        
        return jsonify(leaderboard_list)
    
    except Exception as e:
        logger.error(f"Error generating leaderboard: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500