from flask import Flask, request, jsonify, Blueprint
from openai import OpenAI
import json
import logging
import os
from dotenv import load_dotenv

load_dotenv()

router = Blueprint('generate_questions', __name__)

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure OpenAI
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    logger.info("OpenAI configured successfully")
except Exception as e:
    logger.error("Failed to configure OpenAI: %s", str(e))
    raise RuntimeError("Failed to initialize AI service")

#############################################################
##                       ScheduleQuiz                      ##
#############################################################

@router.route("/generate-questions-quiz", methods=["POST"])
def generate_questions():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        logger.info("Received generate question request with prompt: %s", prompt)

        # Enhanced System Prompt
        system_prompt = """You are an expert quiz generator. Generate multiple choice questions based on the given topic.
        Return the questions in JSON format with this exact structure:
        {
            "questions": [
                {
                    "question": "question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "answer": "actual correct answer text"  // Not just A/B/C/D
                }
            ]
        }
        Important rules:
        1. Always return valid JSON
        2. The answer should be the full correct answer text, not just a letter
        3. Provide exactly 4 options per question
        4. Questions should be challenging and meaningful
        . Don't specify A/B/C/D in optons and correct answer"""
        
        # Generate Content using OpenAI
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Topic: {prompt}\n\nImportant: Only return valid JSON in the specified format."}
                ],
                temperature=0.7
            )
            response_text = response.choices[0].message.content
        except Exception as e:
            logger.error("OpenAI API call failed: %s", str(e))
            return jsonify({"error": f"AI service error: {str(e)}"}), 502
        
        # Handle empty response
        if not response_text:
            logger.error("Empty response from OpenAI")
            return jsonify({"error": "AI service returned empty response"}), 502

        # Clean the response
        raw_content = response_text.strip()
        logger.debug("Raw response: %s", raw_content)

        # More flexible response cleaning
        json_content = raw_content
        if json_content.startswith("```json"):
            json_content = json_content[7:-3].strip()
        elif json_content.startswith("```"):
            json_content = json_content[3:-3].strip()
        
        # Log the cleaned content for debugging
        logger.debug("Cleaned JSON content: %s", json_content)

        try:
            questions_data = json.loads(json_content)
        except json.JSONDecodeError as je:
            logger.error("JSON parse error. Content: %s, Error: %s", json_content, str(je))
            return jsonify({"error": "AI returned invalid JSON format"}), 400

        # Validate the structure
        if "questions" not in questions_data:
            logger.error("Missing 'questions' key in response: %s", questions_data)
            return jsonify({"error": "AI response missing required 'questions' field"}), 400

        validated = []
        for i, q in enumerate(questions_data["questions"]):
            try:
                # Ensure all required fields exist
                if not all(k in q for k in ["question", "options", "answer"]):
                    raise ValueError(f"Question {i} missing required fields")
                
                # Ensure answer is the full text, not just A/B/C/D
                answer = q["answer"]
                if len(answer) == 1 and answer in ["A", "B", "C", "D"]:
                    # If we got a letter answer, convert to text
                    try:
                        index = ord(answer.upper()) - ord('A')
                        answer = q["options"][index]
                    except (IndexError, TypeError):
                        pass
                
                validated.append({
                    "question": q["question"],
                    "options": q["options"][:4],  # Ensure exactly 4 options
                    "answer": answer  # Store the actual answer text
                })
            except Exception as e:
                logger.error("Error processing question %d: %s", i, str(e))
                continue  # Skip invalid questions

        if not validated:
            return jsonify({"error": "No valid questions could be processed"}), 400

        return jsonify({"questions": validated})

    except Exception as e:
        logger.error("Unexpected error: %s", str(e), exc_info=True)
        return jsonify({"error": "Internal server error during question generation"}), 500


#############################################################
##                    ScheduleAssignments                  ##
#############################################################

@router.route("/generate-questions-assignment", methods=["POST"])
def generate_assignment_questions():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        logger.info("Received generate assignment request with prompt: %s", prompt)

        # Enhanced System Prompt for assignments
        system_prompt = """You are an expert assignment generator. Create a mix of multiple choice and descriptive questions based on the given topic.
        Return the questions in JSON format with this exact structure:
        {
            "questions": [
                {
                    "question_type": "mcq" or "descriptive",
                    "question": "question text",
                    "options": ["option1", "option2", "option3", "option4"] (only for mcq),
                    "answer": "actual correct answer text"  // Full answer for both types
                }
            ]
        }
        Important rules:
        1. Always return valid JSON
        2. For MCQs: provide exactly 4 options and the full correct answer text
        3. For descriptive questions: provide a meaningful question and detailed answer
        4. If it's a programming question, the answer must contain fully working and logically correct code.
        5. - Set "is_code": true for programming/code-related answers.
        6. Include a mix of both question types unless specified otherwise
        7. Questions should be challenging and cover different aspects of the topic
        8. Don't specify A/B/C/D in optons and correct answer"""
        
        # Generate Content using OpenAI
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Topic: {prompt}\n\nImportant: Only return valid JSON in the specified format."}
                ],
                temperature=0.7
            )
            response_text = response.choices[0].message.content
        except Exception as e:
            logger.error("OpenAI API call failed: %s", str(e))
            return jsonify({"error": f"AI service error: {str(e)}"}), 502
        
        # Handle empty response
        if not response_text:
            logger.error("Empty response from OpenAI")
            return jsonify({"error": "AI service returned empty response"}), 502

        # Clean the response
        raw_content = response_text.strip()
        logger.debug("Raw response: %s", raw_content)

        # More flexible response cleaning
        json_content = raw_content
        if json_content.startswith("```json"):
            json_content = json_content[7:-3].strip()
        elif json_content.startswith("```"):
            json_content = json_content[3:-3].strip()
        
        # Log the cleaned content for debugging
        logger.debug("Cleaned JSON content: %s", json_content)

        try:
            questions_data = json.loads(json_content)
        except json.JSONDecodeError as je:
            logger.error("JSON parse error. Content: %s, Error: %s", json_content, str(je))
            return jsonify({"error": "AI returned invalid JSON format"}), 400

        # Validate the structure
        if "questions" not in questions_data:
            logger.error("Missing 'questions' key in response: %s", questions_data)
            return jsonify({"error": "AI response missing required 'questions' field"}), 400

        validated = []
        for i, q in enumerate(questions_data["questions"]):
            try:
                # Ensure all required fields exist
                if not all(k in q for k in ["question_type", "question", "answer"]):
                    raise ValueError(f"Question {i} missing required fields")
                
                # Validate question type
                if q["question_type"] not in ["mcq", "descriptive"]:
                    raise ValueError(f"Invalid question type for question {i}")
                
                # Process MCQs
                if q["question_type"] == "mcq":
                    if "options" not in q:
                        raise ValueError(f"MCQ question {i} missing options")
                    
                    # Ensure answer is the full text, not just A/B/C/D
                    answer = q["answer"]
                    if len(answer) == 1 and answer in ["A", "B", "C", "D"]:
                        try:
                            index = ord(answer.upper()) - ord('A')
                            answer = q["options"][index]
                        except (IndexError, TypeError):
                            pass
                    
                    validated.append({
                        "question_type": "mcq",
                        "question": q["question"],
                        "options": q["options"][:4],  # Ensure exactly 4 options
                        "answer": answer
                    })
                
                # Process descriptive questions
                else:
                    validated.append({
                        "question_type": "descriptive",
                        "question": q["question"],
                        "answer": q["answer"]
                    })
                    
            except Exception as e:
                logger.error("Error processing question %d: %s", i, str(e))
                continue  # Skip invalid questions

        if not validated:
            return jsonify({"error": "No valid questions could be processed"}), 400

        return jsonify({"questions": validated})

    except Exception as e:
        logger.error("Unexpected error: %s", str(e), exc_info=True)
        return jsonify({"error": "Internal server error during assignment generation"}), 500


#############################################################
##         Combined Quiz and Assignment Generator         ##
#############################################################

@router.route("/generate-questions-timer-quiz-assignment", methods=["POST"])
def generate_timer_quiz_assignment_questions():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        logger.info("Received generate timer quiz/assignment request with prompt: %s", prompt)

        # Enhanced System Prompt for combined quiz/assignment
        system_prompt = """You are an expert question generator for both quizzes and assignments. 
        Create a mix of multiple choice and descriptive questions based on the given topic.
        Return the questions in JSON format with this exact structure:
        {
            "questions": [
                {
                    "question": "question text",
                    "type": "mcq" or "descriptive",
                    "options": ["option1", "option2", "option3", "option4"] (only for mcq),
                    "answer": "actual correct answer text"  // Full answer for both types
                }
            ]
        }
        Important rules:
        1. Always return valid JSON
        2. For MCQs: provide exactly 4 options and the full correct answer text
        3. For descriptive questions: provide meaningful questions and detailed answers
        4. Include a mix of both question types unless specified otherwise
        5. Questions should be challenging and cover different aspects of the topic
        6. Don't specify A/B/C/D in optons and correct answer"""
        
        # Generate Content using OpenAI
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Topic: {prompt}\n\nImportant: Only return valid JSON in the specified format."}
                ],
                temperature=0.7
            )
            response_text = response.choices[0].message.content
        except Exception as e:
            logger.error("OpenAI API call failed: %s", str(e))
            return jsonify({"error": f"AI service error: {str(e)}"}), 502
        
        # Handle empty response
        if not response_text:
            logger.error("Empty response from OpenAI")
            return jsonify({"error": "AI service returned empty response"}), 502

        # Clean the response
        raw_content = response_text.strip()
        logger.debug("Raw response: %s", raw_content)

        # More flexible response cleaning
        json_content = raw_content
        if json_content.startswith("```json"):
            json_content = json_content[7:-3].strip()
        elif json_content.startswith("```"):
            json_content = json_content[3:-3].strip()
        
        # Log the cleaned content for debugging
        logger.debug("Cleaned JSON content: %s", json_content)

        try:
            questions_data = json.loads(json_content)
        except json.JSONDecodeError as je:
            logger.error("JSON parse error. Content: %s, Error: %s", json_content, str(je))
            return jsonify({"error": "AI returned invalid JSON format"}), 400

        # Validate the structure
        if "questions" not in questions_data:
            logger.error("Missing 'questions' key in response: %s", questions_data)
            return jsonify({"error": "AI response missing required 'questions' field"}), 400

        validated = []
        for i, q in enumerate(questions_data["questions"]):
            try:
                # Ensure all required fields exist
                if not all(k in q for k in ["question", "answer"]):
                    raise ValueError(f"Question {i} missing required fields")
                
                # Default to MCQ if type not specified
                question_type = q.get("type", "mcq")
                if question_type not in ["mcq", "descriptive"]:
                    question_type = "mcq"
                
                # Process MCQs
                if question_type == "mcq":
                    if "options" not in q:
                        raise ValueError(f"MCQ question {i} missing options")
                    
                    # Ensure answer is the full text, not just A/B/C/D
                    answer = q["answer"]
                    if len(answer) == 1 and answer in ["A", "B", "C", "D"]:
                        try:
                            index = ord(answer.upper()) - ord('A')
                            answer = q["options"][index]
                        except (IndexError, TypeError):
                            pass
                    
                    validated.append({
                        "question": q["question"],
                        "type": "mcq",
                        "options": q["options"][:4],  # Ensure exactly 4 options
                        "answer": answer
                    })
                
                # Process descriptive questions
                else:
                    validated.append({
                        "question": q["question"],
                        "type": "descriptive",
                        "answer": q["answer"]
                    })
                    
            except Exception as e:
                logger.error("Error processing question %d: %s", i, str(e))
                continue  # Skip invalid questions

        if not validated:
            return jsonify({"error": "No valid questions could be processed"}), 400

        return jsonify({"questions": validated})

    except Exception as e:
        logger.error("Unexpected error: %s", str(e), exc_info=True)
        return jsonify({"error": "Internal server error during question generation"}), 500