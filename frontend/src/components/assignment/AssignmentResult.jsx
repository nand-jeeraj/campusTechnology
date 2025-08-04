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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2d3748;
`;

const Header = styled(motion.h2)`
  font-size: 2rem;
  color: #2b6cb0;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AssignmentCard = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  border-left: 4px solid #4299e1;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const AssignmentTitle = styled.h3`
  font-size: 1.5rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const SubmissionTime = styled.p`
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ReviewSection = styled.div`
  margin-top: 1.5rem;
`;

const QuestionCard = styled(motion.div)`
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 3px solid ${props => props.correct ? "#48bb78" : "#f56565"};
`;

const QuestionHeader = styled.p`
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeedbackText = styled.p`
  background: #ebf8ff;
  border-radius: 0.25rem;
  padding: 0.75rem;
  margin-top: 0.5rem;
  color: #2b6cb0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  line-height: 1.5;
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 3rem;
  background: #f8fafc;
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
      duration: 0.4
    }
  }
};

function AssignmentResult({ userId = "Student123" }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}Student-assignment-submissions/${userId}`)
      .then((res) => {
        setResults(res.data.assignments || []);
      })
      .catch((err) => {
        alert("Failed to load assignment results");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <Header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span>📝</span> Your Assignment Submissions
        </Header>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={`skeleton-${i}`} variants={itemVariants} />
          ))}
        </motion.div>
      </Container>
    );
  }

  if (results.length === 0) {
    return (
      <Container>
        <Header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span>📝</span> Your Assignment Submissions
        </Header>
        <EmptyState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          No assignment submissions found.
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span>📝</span> Your Assignment Submissions
      </Header>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {results.map((asg, idx) => (
          <AssignmentCard
            key={idx}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <AssignmentTitle>{asg.assignment_title}</AssignmentTitle>
            <SubmissionTime>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Submitted at: {new Date(asg.submitted_at).toLocaleString()}
            </SubmissionTime>

            <ReviewSection>
              <h4>Review:</h4>
              {asg.details.map((q, qidx) => (
                <QuestionCard
                  key={qidx}
                  correct={q.correct}
                  variants={itemVariants}
                >
                  <QuestionHeader>
                    {q.correct ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#48bb78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f56565" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                    )}
                    Q{qidx + 1} — {q.correct ? "Correct" : "Incorrect"}
                  </QuestionHeader>
                  {q.feedback && (
                    <FeedbackText>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>AI Feedback: {q.feedback}</span>
                    </FeedbackText>
                  )}
                </QuestionCard>
              ))}
            </ReviewSection>
          </AssignmentCard>
        ))}
      </motion.div>
    </Container>
  );
}

export default AssignmentResult;