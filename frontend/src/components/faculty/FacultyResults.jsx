import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import styled from "styled-components";
import { BASE_URL } from '../../services/api';

// Styled Components
const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2d3748;
`;

const Header = styled(motion.h2)`
  font-size: 2rem;
  color: #2b6cb0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionHeader = styled(motion.h3)`
  font-size: 1.5rem;
  color: #4a5568;
  margin: 2rem 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SubmissionCard = styled(motion.div)`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4299e1;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const UserInfo = styled.div`
  font-weight: 600;
  color: #2b6cb0;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #718096;
`;

const ScoreBadge = styled.span`
  background: ${props => props.score >= 70 ? '#48bb78' : props.score >= 50 ? '#ed8936' : '#f56565'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
`;

const QuestionItem = styled.div`
  background: #f7fafc;
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeedbackText = styled.span`
  color: #4a5568;
  font-style: italic;
`;

const LoadingSkeleton = styled(motion.div)`
  background: #e2e8f0;
  border-radius: 0.25rem;
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

function FacultyResults() {
  const [quizResults, setQuizResults] = useState([]);
  const [assignmentResults, setAssignmentResults] = useState([]);
  const [loading, setLoading] = useState({
    quizzes: true,
    assignments: true
  });

  useEffect(() => {
    axios.get(`${BASE_URL}all-submissions`).then((res) => {
      setQuizResults(res.data.submissions || []);
      setLoading(prev => ({ ...prev, quizzes: false }));
    });

    axios.get(`${BASE_URL}all-assignment-submissions`).then((res) => {
      setAssignmentResults(res.data.submissions || []);
      setLoading(prev => ({ ...prev, assignments: false }));
    });
  }, []);

  return (
    <DashboardContainer>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
        Submission Results Dashboard
      </Header>

      <SectionHeader
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        Quiz Submissions
      </SectionHeader>

      {loading.quizzes ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={`quiz-skeleton-${i}`} variants={itemVariants} />
          ))}
        </motion.div>
      ) : quizResults.length === 0 ? (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ color: '#718096', textAlign: 'center', fontStyle: 'italic' }}
        >
          No quiz submissions found
        </motion.p>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {quizResults.map((sub, idx) => (
            <SubmissionCard
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
            >
              <UserInfo>
                <span>{sub.user_id} | {sub.quiz_title}</span>
                {sub.score !== undefined && <ScoreBadge score={sub.score}>Score: {sub.score}</ScoreBadge>}
              </UserInfo>
              
              <MetaInfo>
                <span>Submitted: {new Date(sub.submitted_at).toLocaleString()}</span>
              </MetaInfo>

              {sub.details?.map((d, i) => (
                <QuestionItem key={i}>
                  <span>{d.correct ? "✅" : "❌"}</span>
                  <span><strong>Q{i + 1}:</strong> {d.question || 'Question'}</span>
                  {d.feedback && <FeedbackText>— {d.feedback}</FeedbackText>}
                </QuestionItem>
              ))}
            </SubmissionCard>
          ))}
        </motion.div>
      )}

      <SectionHeader
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Assignment Submissions
      </SectionHeader>

      {loading.assignments ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={`assign-skeleton-${i}`} variants={itemVariants} />
          ))}
        </motion.div>
      ) : assignmentResults.length === 0 ? (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ color: '#718096', textAlign: 'center', fontStyle: 'italic' }}
        >
          No assignment submissions found
        </motion.p>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {assignmentResults.map((sub, idx) => (
            <SubmissionCard
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
            >
              <UserInfo>
                <span>{sub.user_id} | {sub.assignment_title}</span>
                {sub.score !== undefined && <ScoreBadge score={sub.score}>Score: {sub.score}</ScoreBadge>}
              </UserInfo>
              
              <MetaInfo>
                <span>Submitted: {new Date(sub.submitted_at).toLocaleString()}</span>
              </MetaInfo>

              {sub.details?.map((d, i) => (
                <QuestionItem key={i}>
                  <span>{d.correct ? "✅" : "❌"}</span>
                  <span><strong>Q{i + 1}:</strong> {d.question || 'Question'}</span>
                  {d.feedback && <FeedbackText>— {d.feedback}</FeedbackText>}
                </QuestionItem>
              ))}
            </SubmissionCard>
          ))}
        </motion.div>
      )}
    </DashboardContainer>
  );
}

export default FacultyResults;