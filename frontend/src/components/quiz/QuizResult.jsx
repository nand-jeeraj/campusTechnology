import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../../services/api';

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled(motion.h2)`
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const QuizCard = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid #4299e1;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const QuizTitle = styled.h3`
  font-size: 1.5rem;
  color: #2b6cb0;
  margin-bottom: 1rem;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  color: #4a5568;
`;

const ScoreBadge = styled.span`
  background: ${props => props.score >= 80 ? '#48bb78' : props.score >= 60 ? '#ed8936' : '#f56565'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
`;

const QuestionItem = styled(motion.div)`
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 3px solid ${props => props.correct ? '#48bb78' : '#f56565'};
`;

const QuestionText = styled.p`
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeedbackText = styled.div`
  background: #ebf8ff;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: #2b6cb0;
  display: flex;
  gap: 0.5rem;
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 3rem;
  background: #f7fafc;
  border-radius: 0.75rem;
  color: #718096;
`;

const LoadingSkeleton = styled(motion.div)`
  background: #e2e8f0;
  border-radius: 0.5rem;
  height: 4rem;
  margin-bottom: 1rem;
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

function QuizResult({ userId = "Student123" }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}Student-submissions/${userId}`)
      .then((res) => {
        setSubmissions(res.data.quizzes || []);
      })
      .catch((err) => {
        alert("Failed to load results");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span role="img" aria-label="document">🧾</span> Your Quiz Submissions
        </Header>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={`skeleton-${i}`} variants={itemVariants} />
          ))}
        </motion.div>
      </Container>
    );
  }

  if (submissions.length === 0) {
    return (
      <Container>
        <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span role="img" aria-label="document">🧾</span> Your Quiz Submissions
        </Header>
        <EmptyState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          No quiz submissions found.
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <span role="img" aria-label="document">🧾</span> Your Quiz Submissions
      </Header>
      
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {submissions.map((quiz, idx) => (
          <QuizCard
            key={idx}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <QuizTitle>{quiz.quiz_title}</QuizTitle>
            <MetaInfo>
              <div>
                <strong>Score:</strong> <ScoreBadge score={quiz.score}>{quiz.score}</ScoreBadge>
              </div>
              <div>
                <strong>Submitted:</strong> {new Date(quiz.submitted_at).toLocaleString()}
              </div>
            </MetaInfo>
            
            <h4>Question Review:</h4>
            {quiz.details.map((q, qidx) => (
              <QuestionItem
                key={qidx}
                correct={q.correct}
                variants={itemVariants}
              >
                <QuestionText>
                  {q.correct ? (
                    <span role="img" aria-label="correct">✅</span>
                  ) : (
                    <span role="img" aria-label="incorrect">❌</span>
                  )}
                  <strong>Q{qidx + 1}:</strong> {q.question_text || `Question ${qidx + 1}`}
                </QuestionText>
                {q.feedback && (
                  <FeedbackText>
                    <span role="img" aria-label="feedback">💡</span> 
                    <div>
                      <strong>AI Feedback:</strong> {q.feedback}
                    </div>
                  </FeedbackText>
                )}
              </QuestionItem>
            ))}
          </QuizCard>
        ))}
      </motion.div>
    </Container>
  );
}

export default QuizResult;