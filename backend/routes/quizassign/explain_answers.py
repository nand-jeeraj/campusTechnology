from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from openai import OpenAI
import logging
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

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

class ExplanationRequest(BaseModel):
    question: str
    user_answer: str
    correct_answer: str
    question_type: str  # "mcq" or "descriptive"

class ExplanationResponse(BaseModel):
    explanation: str

@router.post("/explain-answer", response_model=ExplanationResponse)
async def explain_answer(request: ExplanationRequest):
    try:
        logger.info("Generating explanation for question: %s", request.question[:50] + "...")

        # System prompt for explanations
        system_prompt = """You are an expert teacher explaining answers to students. Provide clear, concise explanations in simple language.
        
        For MCQ questions:
        1. Explain why the correct answer is right
        2. Explain why the student's answer was right/wrong
        3. Keep it brief (1-2 sentences)
        
        For descriptive questions:
        1. Point out key elements in the correct answer
        2. Compare with student's answer
        3. Provide constructive feedback
        4. Keep it brief (2-3 sentences)"""

        user_prompt = f"""
        Question: {request.question}
        Question Type: {request.question_type}
        Student's Answer: {request.user_answer}
        
        Provide a simple explanation that a student can easily understand:"""

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
            raise HTTPException(502, detail=f"AI service error: {str(e)}")

        if not explanation:
            logger.error("Empty explanation from OpenAI")
            raise HTTPException(502, detail="AI service returned empty explanation")

        return ExplanationResponse(explanation=explanation)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error: %s", str(e), exc_info=True)
        raise HTTPException(500, detail="Internal server error during explanation generation")