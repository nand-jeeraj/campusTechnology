import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BASE_URL } from '../../services/api';

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.h1`
  color: #2b6cb0;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-align: center;
  position: relative;
  padding-bottom: 0.5rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #4299e1, #3182ce);
    border-radius: 3px;
  }
`;

const QuestionCard = styled(motion.div)`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4299e1;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const QuestionText = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const OptionLabel = styled(motion.label)`
  display: block;
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:hover {
    border-color: #4299e1;
    background: #ebf8ff;
  }

  input[type="radio"] {
    margin-right: 0.75rem;
    accent-color: #4299e1;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const SubmitButton = styled(motion.button)`
  display: block;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin: 2rem 0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsContainer = styled(motion.div)`
  background: #f0fff4;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  border-left: 4px solid #48bb78;
`;

const ResultItem = styled(motion.li)`
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.95rem;

  &:last-child {
    border-bottom: none;
  }

  span {
    margin-left: 0.5rem;
    font-weight: ${props => props.correct ? '600' : '500'};
    color: ${props => props.correct ? '#48bb78' : '#e53e3e'};
  }
`;

const ResultIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 0.75rem;
`;

const ScoreDisplay = styled.div`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2b6cb0;
`;

const Timer = styled.div`
  text-align: right;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #e53e3e;
  font-weight: 500;
`;

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

const optionVariants = {
  hover: { scale: 1.02 }
};

const buttonVariants = {
  hover: { scale: 1.01 },
  tap: { scale: 0.98 }
};

const resultsVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const resultItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

function SubmitAssignment({ assignmentId }) {
  const [assignment, setAssignment] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/assignment/${assignmentId}`);
        setAssignment(response.data);
        setTotalQuestions(response.data.questions.length);
        
        // If it's a scheduled assignment, set up timer
        if (response.data.start_time && response.data.end_time) {
          const endTime = new Date(response.data.end_time).getTime();
          const durationMinutes = response.data.duration_minutes || 60;
          
          // Calculate time left based on duration or end time
          const now = new Date().getTime();
          const timeLeftMs = Math.min(
            endTime - now,
            durationMinutes * 60 * 1000
          );
          
          if (timeLeftMs > 0) {
            setTimeLeft(Math.floor(timeLeftMs / 1000));
            startTimer(timeLeftMs);
          } else {
            setError("This assignment has expired");
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load assignment");
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const startTimer = (durationMs) => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError("Time's up! Please submit your answers.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (qid, value) => {
    setResponses({ ...responses, [qid]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare submission data
      const submissionData = {
        assignment_id: assignmentId,
        user_id: "current_user_id", // Replace with actual user ID
        responses: Object.entries(responses).map(([question_id, response]) => ({
          question_id,
          response
        }))
      };
      
      const response = await axios.post(`${BASE_URL}/api/submit-assignment`, submissionData);
      
      setResults(response.data.results);
      setScore(response.data.score);
      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError("Failed to submit assignment");
      setLoading(false);
    }
  };

  if (loading) {
    return <Container>Loading assignment...</Container>;
  }

  if (error) {
    return <Container>{error}</Container>;
  }

  if (!assignment) {
    return <Container>Assignment not found</Container>;
  }

  return (
    <Container>
      <Header>{assignment.title}</Header>
      
      {timeLeft !== null && (
        <Timer>Time Remaining: {formatTime(timeLeft)}</Timer>
      )}
      
      {assignment.questions.map((q, idx) => (
        <QuestionCard
          key={q.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: idx * 0.05 }}
        >
          <QuestionText>{idx + 1}. {q.question}</QuestionText>
          {q.type === "mcq" ? (
            q.options.map((opt, i) => (
              <OptionLabel
                key={i}
                variants={optionVariants}
                whileHover="hover"
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  onChange={() => handleChange(q.id, opt)}
                  disabled={submitted || timeLeft === 0}
                />
                {opt}
              </OptionLabel>
            ))
          ) : (
            <TextArea
              rows="5"
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder="Type your answer here..."
              disabled={submitted || timeLeft === 0}
            />
          )}
        </QuestionCard>
      ))}

      <SubmitButton
        onClick={handleSubmit}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        disabled={submitted || loading || timeLeft === 0}
      >
        {loading ? "Submitting..." : "Submit Assignment"}
      </SubmitButton>

      <AnimatePresence>
        {submitted && (
          <ResultsContainer
            initial="hidden"
            animate="visible"
            variants={resultsVariants}
          >
            <ScoreDisplay>
              Your Score: {score} / {totalQuestions}
            </ScoreDisplay>
            <h3>Question Results:</h3>
            <ul>
              {results.map((res, idx) => (
                <ResultItem
                  key={idx}
                  variants={resultItemVariants}
                  correct={res.correct}
                >
                  <ResultIcon>
                    {res.correct ? "✅" : "❌"}
                  </ResultIcon>
                  Question {idx + 1}: <span>{res.correct ? "Correct" : "Incorrect"}</span>
                </ResultItem>
              ))}
            </ul>
          </ResultsContainer>
        )}
      </AnimatePresence>
    </Container>
  );
}

export default SubmitAssignment;