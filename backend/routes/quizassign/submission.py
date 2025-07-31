from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Union, Optional
from pymongo import MongoClient
from datetime import datetime
import logging
from bson import ObjectId
from openai import OpenAI
import re
import os
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

ai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]
scheduled_quiz_collection = db["scheduled_quizzes"]
quizzes_collection = db["quizzes"]
submissions_collection = db["submissions"]

class Answer(BaseModel):
    text: Optional[str] = Field(None, description="The answer text")
    selected_option: Optional[str] = Field(None, description="For MCQs")
    is_correct: Optional[bool] = Field(None, description="Will be set by the backend")

class Submission(BaseModel):
    user_id: str = Field(..., description="Unique user identifier")
    quiz_id: str = Field(..., description="Quiz identifier")
    quiz_title: str = Field(..., description="Quiz title")
    answers: Dict[str, Union[str, Answer]] = Field(..., description="Question answers")
    auto_submitted: bool = Field(False, description="Was this auto-submitted?")
    retake_reason: Optional[str] = Field(None, description="Reason for retaking")

def extract_grade_from_response(response_text: str) -> bool:
    """
    Extracts grading decision from the GPT response.
    Returns True if 'Correct' is found, False if 'Incorrect', otherwise defaults to False.
    """
    decision = response_text.strip().lower()
    
    # Direct one-word response
    if decision in ["correct", "incorrect"]:
        return decision == "correct"
    
    # Search for the words "correct" or "incorrect" in the response
    match = re.search(r'\b(correct|incorrect)\b', decision)
    if match:
        return match.group(1) == "correct"
    
    # If nothing matched, consider it incorrect (fail-safe)
    return False


def grade_descriptive_answer(question_text, user_answer_text, correct_answer_text):
    logger.info("📡 AI GRADING TRIGGERED: Grading descriptive answer via OpenAI")
    try:
        prompt = f"""
You are an AI examiner evaluating a student's answer. Your job is to decide if the student's answer is logically and factually correct, even if it's written in a different style than the reference.

🎯 Grading Rules:
- Accept correct answers even if they are written in a different way or are shorter.
- Accept valid paraphrasing, alternate explanations, or simpler words that still reflect the right concept.
- Ignore spelling, grammar, or small formatting differences.
- Do NOT compare word-for-word or expect exact phrasing.
- Reject only if the answer is wrong, incomplete, or unrelated.

Respond with only ONE word: **Correct** or **Incorrect**.

---

Question:
{question_text}

Reference Answer:
{correct_answer_text}

Student's Answer:
{user_answer_text}

Final Grade (one word only):
"""

        response = ai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a strict but fair examiner who only responds with Correct or Incorrect."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        response_text = response.choices[0].message.content.strip()
        logger.info(f"✅ AI response received:\n{response_text}")

        return extract_grade_from_response(response_text)

    except Exception as e:
        logger.error(f"❌ AI grading failed for question '{question_text}': {e}", exc_info=True)
        return None

@router.post("/submit")
async def submit_quiz(submission: Submission):
    try:
        logger.info(f"Received submission payload: {submission.dict()}")
        
        # Convert string ID to ObjectId for MongoDB query
        try:
            quiz_id = ObjectId(submission.quiz_id)
        except:
            logger.error(f"Invalid quiz ID format: {submission.quiz_id}")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid quiz ID",
                    "message": "The quiz ID format is invalid"
                }
            )

        # Validate quiz exists
        quiz = quizzes_collection.find_one({"_id": quiz_id})
        if not quiz:
            quiz = scheduled_quiz_collection.find_one({"_id": quiz_id})
            if not quiz:
                logger.error(f"Quiz not found with ID: {submission.quiz_id}")
                # Log all available quiz IDs for debugging
                all_quiz_ids = [str(q["_id"]) for q in quizzes_collection.find({}, {"_id": 1})]
                logger.info(f"Available quiz IDs: {all_quiz_ids}")
                
                raise HTTPException(
                    status_code=404,
                    detail={
                        "error": "Quiz not found",
                        "message": f"No quiz found with ID {submission.quiz_id}",
                        "available_quizzes": all_quiz_ids
                    }
                )

        # Check for existing submissions
        existing = submissions_collection.find_one({
            "user_id": submission.user_id,
            "quiz_id": submission.quiz_id
        })
        if existing and not quiz.get("allow_retakes", False):
            logger.warning(f"Duplicate submission attempt by {submission.user_id}")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Duplicate submission",
                    "message": "You've already submitted this quiz"
                }
            )

        score = 0
        total_questions = len(quiz["questions"])

        # Process each question
        for q in quiz["questions"]:
            question_text = q["question"]
            user_answer = submission.answers.get(question_text)
            
            if user_answer is None:
                logger.info("User is un answered")
                continue  # Skip unanswered questions (handled by frontend validation)
            
            correct_answer = q.get("answer", "").strip().lower()
            correct = False

            # Handle both string and Answer object formats
            if isinstance(user_answer, str):
                # Simple string answer
                user_answer_str = user_answer.strip().lower()
                correct = (user_answer_str == correct_answer)

            elif isinstance(user_answer, Answer):
                if not q.get("options"):  # Descriptive question
                    if user_answer.text:
                        logger.info(f"🧠 Triggering AI grading for question: {question_text}")
                        logger.info(f"Student answer: {user_answer.text.strip()}")
                        logger.info(f"Expected answer: {correct_answer}")
                        is_correct_ai = grade_descriptive_answer(
                            question_text,
                            user_answer.text.strip(),
                            correct_answer
                        )
                        logger.info(f"AI marked this answer as: {'Correct' if is_correct_ai else 'Incorrect'}")
                        logging.info("AI checking your answer")
                        user_answer.is_correct = is_correct_ai
                        if is_correct_ai:
                            score += 1
                    else:
                        logger.info("Descriptive answer is empty, skipping AI check.")
                else:
                    selected_option = user_answer.selected_option.strip().lower() if user_answer.selected_option else ""
                    correct = (selected_option == correct_answer)
                    user_answer.is_correct = correct
                    logger.info(f"selected_option : {selected_option}, type : {type(selected_option)}")
                    logger.info(f"correct_answer : {correct_answer}, type : {type(correct_answer)}")
     
            if correct:
                score += 1

        # Prepare submission data
        submission_data = {
            "user_id": submission.user_id,
            "quiz_id": submission.quiz_id,
            "quiz_title": submission.quiz_title,
            "answers": {
                key: val.dict() if isinstance(val, Answer) else val
                for key, val in submission.answers.items()
            },
            "score": score,
            "total_questions": total_questions,
            "percentage": round((score / total_questions) * 100, 2) if total_questions else 0,
            "auto_submitted": submission.auto_submitted,
            "retake_reason": submission.retake_reason,
            "submitted_at": datetime.utcnow()
        }

        # Insert into database
        result = submissions_collection.insert_one(submission_data)
        logger.info(f"Submission saved with ID: {result.inserted_id}")

        return {
            "success": True,
            "result": {
                "score": score,
                "total_questions": total_questions,
                "percentage": round((score / total_questions) * 100, 2) if total_questions else 0,
                "message": "Descriptive answers will be graded separately" if any(
                    not q.get("options") for q in quiz["questions"])
                else "Quiz graded successfully"
            }
        }

    except HTTPException as e:
        logger.error(f"HTTP Exception: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)
            }
        )

# ==============================================
#               ASSIGNMENT CODE
# ==============================================

scheduled_assignment_collection = db["scheduled_assignments"]
assignments_collection = db["assignments"]
assignment_submissions_collection = db["assignment_submissions"]

class AssignmentAnswer(BaseModel):
    text: Optional[str] = Field(None, description="The answer text")
    selected_option: Optional[str] = Field(None, description="For MCQs")
    is_correct: Optional[bool] = Field(None, description="Will be set by the backend")

class AssignmentSubmission(BaseModel):
    user_id: str = Field(..., description="Unique user identifier")
    assignment_id: str = Field(..., description="Assignment identifier")
    assignment_title: str = Field(..., description="Assignment title")
    answers: Dict[str, Union[str, AssignmentAnswer]] = Field(..., description="Question answers")
    auto_submitted: bool = Field(False, description="Was this auto-submitted?")
    retake_reason: Optional[str] = Field(None, description="Reason for retaking")

@router.post("/submit-assignment")
async def submit_assignment(submission: AssignmentSubmission):
    try:
        logger.info(f"Received assignment submission payload: {submission.dict()}")
        
        # Convert string ID to ObjectId for MongoDB query
        try:
            assignment_id = ObjectId(submission.assignment_id)
        except:
            logger.error(f"Invalid assignment ID format: {submission.assignment_id}")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid assignment ID",
                    "message": "The assignment ID format is invalid"
                }
            )

        # Validate assignment exists
        assignment = assignments_collection.find_one({"_id": assignment_id})
        if not assignment:
            assignment = scheduled_assignment_collection.find_one({"_id": assignment_id})
            if not assignment:
                logger.error(f"Assignment not found with ID: {submission.assignment_id}")
                # Log all available assignment IDs for debugging
                all_assignment_ids = [str(q["_id"]) for q in assignments_collection.find({}, {"_id": 1})]
                logger.info(f"Available assignment IDs: {all_assignment_ids}")
                
                raise HTTPException(
                    status_code=404,
                    detail={
                        "error": "Assignment not found",
                        "message": f"No assignment found with ID {submission.assignment_id}",
                        "available_assignments": all_assignment_ids
                    }
                )

        # Check for existing submissions
        existing = assignment_submissions_collection.find_one({
            "user_id": submission.user_id,
            "assignment_id": submission.assignment_id
        })
        if existing and not assignment.get("allow_retakes", False):
            logger.warning(f"Duplicate assignment submission attempt by {submission.user_id}")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Duplicate submission",
                    "message": "You've already submitted this assignment"
                }
            )

        score = 0
        total_questions = len(assignment["questions"])

        # Process each question
        for q in assignment["questions"]:
            question_text = q["question"]
            user_answer = submission.answers.get(question_text)
            
            if user_answer is None:
                logger.info("User is un answered")
                continue  # Skip unanswered questions (handled by frontend validation)
            
            correct_answer = q.get("answer", "").strip().lower()
            correct = False

            # Handle both string and Answer object formats
            if isinstance(user_answer, str):
                # Simple string answer
                user_answer_str = user_answer.strip().lower()
                correct = (user_answer_str == correct_answer)

            elif isinstance(user_answer, AssignmentAnswer):
                if not q.get("options"):  # Descriptive question
                    if user_answer.text:
                        logger.info(f"🧠 Triggering AI grading for question: {question_text}")
                        logger.info(f"Student answer: {user_answer.text.strip()}")
                        logger.info(f"Expected answer: {correct_answer}")
                        is_correct_ai = grade_descriptive_answer(
                            question_text,
                            user_answer.text.strip(),
                            correct_answer
                        )
                        logger.info(f"AI marked this answer as: {'Correct' if is_correct_ai else 'Incorrect'}")
                        user_answer.is_correct = is_correct_ai
                        if is_correct_ai:
                            score += 1
                    else:
                        logger.info("Descriptive answer is empty, skipping AI check.")
                else:
                    selected_option = user_answer.selected_option.strip().lower() if user_answer.selected_option else ""
                    correct = (selected_option == correct_answer)
                    user_answer.is_correct = correct
                    logger.info(f"selected_option : {selected_option}, type : {type(selected_option)}")
                    logger.info(f"correct_answer : {correct_answer}, type : {type(correct_answer)}")
            
            if correct:
                score += 1

        # Prepare submission data
        submission_data = {
            "user_id": submission.user_id,
            "assignment_id": submission.assignment_id,
            "assignment_title": submission.assignment_title,
            "answers": {
                key: val.dict() if isinstance(val, AssignmentAnswer) else val
                for key, val in submission.answers.items()
            },
            "score": score,
            "total_questions": total_questions,
            "percentage": round((score / total_questions) * 100, 2) if total_questions else 0,
            "auto_submitted": submission.auto_submitted,
            "retake_reason": submission.retake_reason,
            "submitted_at": datetime.utcnow()
        }

        # Insert into database
        result = assignment_submissions_collection.insert_one(submission_data)
        logger.info(f"Assignment submission saved with ID: {result.inserted_id}")

        return {
            "success": True,
            "result": {
                "score": score,
                "total_questions": total_questions,
                "percentage": round((score / total_questions) * 100, 2) if total_questions else 0,
                "message": "Descriptive answers will be graded separately" if any(
                    not q.get("options") for q in assignment["questions"])
                else "Assignment graded successfully"
            }
        }

    except HTTPException as e:
        logger.error(f"HTTP Exception: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)
            }
        )