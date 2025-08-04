import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import styled from "styled-components";
import { BASE_URL } from '../../services/api';
// Styled Components
const EvaluatorContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Title = styled(motion.h2)`
  font-size: 2rem;
  color: #2b6cb0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #edf2f7;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const EvaluateButton = styled(motion.button)`
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  margin: 1rem 0;

  &:hover {
    background: #3182ce;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled(motion.div)`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #4299e1;
`;

const ResultItem = styled.p`
  margin: 0.5rem 0;
  line-height: 1.6;
`;

const ScoreBadge = styled.span`
  display: inline-block;
  background: ${props => {
    if (props.score >= 80) return '#48bb78';
    if (props.score >= 50) return '#ed8936';
    return '#f56565';
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const LoadingDots = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
`;

const Dot = styled(motion.span)`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
`;

function EvaluateAnswer() {
  const [StudentAnswer, setStudentAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEvaluate = () => {
    if (!StudentAnswer.trim() || !correctAnswer.trim()) {
      setError("Both answers must be provided");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    axios
      .post(`${BASE_URL}evaluate-descriptive`, {
        Student_answer: StudentAnswer,
        correct_answer: correctAnswer,
      })
      .then((res) => {
        setResult(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Evaluation failed. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <EvaluatorContainer>
      <Title
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Descriptive Answer Evaluator
      </Title>
      
      <InputGroup>
        <Label>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#48BB78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Correct Answer
        </Label>
        <TextArea
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter the model correct answer..."
        />
      </InputGroup>
      
      <InputGroup>
        <Label>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12L15 15" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Student Answer
        </Label>
        <TextArea
          value={StudentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          placeholder="Enter the Student's answer to evaluate..."
        />
      </InputGroup>
      
      <EvaluateButton
        onClick={handleEvaluate}
        disabled={isLoading || !StudentAnswer.trim() || !correctAnswer.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <>
            Evaluating
            <LoadingDots>
              <Dot animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
              <Dot animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
              <Dot animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
            </LoadingDots>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Evaluate Answer
          </>
        )}
      </EvaluateButton>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message"
          style={{ color: '#f56565', marginTop: '1rem' }}
        >
          {error}
        </motion.div>
      )}
      
      {result && (
        <ResultContainer
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <ResultItem>
            <b>Score:</b> <ScoreBadge score={result.score}>{result.score}</ScoreBadge>
          </ResultItem>
          <ResultItem>
            <b>Feedback:</b> {result.feedback}
          </ResultItem>
        </ResultContainer>
      )}
    </EvaluatorContainer>
  );
}

export default EvaluateAnswer;