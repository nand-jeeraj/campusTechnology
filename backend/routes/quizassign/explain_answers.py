from flask import Blueprint, request, jsonify
from openai import OpenAI
import logging
import os
from dotenv import load_dotenv

load_dotenv()

router = Blueprint('explain_answers', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure OpenAI
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    logger.info("OpenAI configured successfully")
except Exception as e:
    logger.error("Failed to configure OpenAI: %s", str(e))
    raise RuntimeError("Failed to initialize AI service")

class ExplanationRequest:
    def __init__(self, question: str, user_answer: str, correct_answer: str, question_type: str):
        self.question = question
        self.user_answer = user_answer
        self.correct_answer = correct_answer
        self.question_type = question_type  # "mcq" or "descriptive"

class ExplanationResponse:
    def __init__(self, explanation: str):
        self.explanation = explanation

@router.route("/explain-answer", methods=["POST"])
def explain_answer():
    try:
        data = request.get_json()
        request_obj = ExplanationRequest(
            question=data['question'],
            user_answer=data['user_answer'],
            correct_answer=data['correct_answer'],
            question_type=data['question_type']
        )

        logger.info("Generating explanation for question: %s", request_obj.question[:50] + "...")

        # System prompt for explanations
        system_prompt = """You are an expert teacher explaining answers to Students. Provide clear, concise explanations in simple language.
        
        For MCQ questions:
        1. Explain why the correct answer is right
        2. Explain why the Student's answer was right/wrong
        3. Keep it brief (1-2 sentences)
        
        For descriptive questions:
        1. Point out key elements in the correct answer
        2. Compare with Student's answer
        3. Provide constructive feedback
        4. Keep it brief (2-3 sentences)"""

        user_prompt = f"""
        Question: {request_obj.question}
        Question Type: {request_obj.question_type}
        Student's Answer: {request_obj.user_answer}
        
        Provide a simple explanation that a Student can easily understand:"""

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3  # Keep explanations focused
            )
            explanation = response.choices[0].message.content.strip()
        except Exception as e:
            logger.error("OpenAI API call failed: %s", str(e))
            return jsonify({"detail": f"AI service error: {str(e)}"}), 502

        if not explanation:
            logger.error("Empty explanation from OpenAI")
            return jsonify({"detail": "AI service returned empty explanation"}), 502

        return jsonify(ExplanationResponse(explanation=explanation).__dict__)

    except Exception as e:
        logger.error("Unexpected error: %s", str(e), exc_info=True)
        return jsonify({"detail": "Internal server error during explanation generation"}), 500