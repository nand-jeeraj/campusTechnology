import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import styled from "styled-components";
import { BASE_URL } from '../../services/api';

// Styled Components
const HistoryContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const PageHeader = styled(motion.h2)`
  font-size: 2rem;
  color: #1a365d;
  margin-bottom: 2.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #edf2f7;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SectionCard = styled(motion.section)`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.75rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const SectionHeader = styled.h3`
  font-size: 1.375rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  color: #64748b;
  font-size: 1rem;
`;

const SubmissionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
`;

const SubmissionItem = styled(motion.li)`
  background: #f8fafc;
  border-left: 4px solid #4299e1;
  padding: 1.25rem;
  border-radius: 0.5rem;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const ItemTitle = styled.span`
  font-weight: 600;
  color: #2b6cb0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ScorePill = styled.span`
  background: ${props => {
    if (props.score >= 80) return '#38a169';
    if (props.score >= 60) return '#dd6b20';
    return '#e53e3e';
  }};
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
  min-width: 80px;
  text-align: center;
`;

const ScoreDetail = styled.span`
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  background: #edf2f7;
  text-align: center;
`;

const DateText = styled.span`
  color: #4a5568;
  font-size: 0.875rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const LoadingSkeleton = styled(motion.div)`
  background: #edf2f7;
  border-radius: 0.5rem;
  height: 72px;
  margin-bottom: 0.75rem;
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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState({ quizzes: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE_URL}Student-submissions/${userId}`)
      .then(res => {
        setSubmissions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [userId]);

  return (
    <HistoryContainer>
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12H15M9 16H15M21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6Z" stroke="#1a365d" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        My Submission History
      </PageHeader>
      
      <SectionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <SectionHeader>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#2d3748" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Quizzes
        </SectionHeader>
        
        {loading ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={`quiz-skel-${i}`} variants={itemVariants} />
            ))}
          </motion.div>
        ) : submissions.quizzes.length === 0 ? (
          <EmptyState
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            No quiz submissions found
          </EmptyState>
        ) : (
          <SubmissionList>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {submissions.quizzes.map((quiz, idx) => (
                <SubmissionItem
                  key={`quiz-${idx}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <ItemTitle>{quiz.quiz_title}</ItemTitle>
                  <ScoreDetail>{quiz.score}/{quiz.total_questions}</ScoreDetail>
                  <ScorePill score={quiz.percentage}>{quiz.percentage}%</ScorePill>
                  <DateText>{new Date(quiz.submitted_at).toLocaleString()}</DateText>
                </SubmissionItem>
              ))}
            </motion.div>
          </SubmissionList>
        )}
      </SectionCard>

      <SectionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <SectionHeader>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#2d3748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="#2d3748" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 17H8" stroke="#2d3748" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 9H9H8" stroke="#2d3748" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Assignments
        </SectionHeader>
        
        {loading ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={`assign-skel-${i}`} variants={itemVariants} />
            ))}
          </motion.div>
        ) : submissions.assignments.length === 0 ? (
          <EmptyState
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No assignment submissions found
          </EmptyState>
        ) : (
          <SubmissionList>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {submissions.assignments.map((assign, idx) => (
                <SubmissionItem
                  key={`assign-${idx}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <ItemTitle>{assign.assignment_title}</ItemTitle>
                  <ScoreDetail>{assign.score}/{assign.total_questions}</ScoreDetail>
                  <ScorePill score={assign.percentage}>{assign.percentage}%</ScorePill>
                  <DateText>{new Date(assign.submitted_at).toLocaleString()}</DateText>
                </SubmissionItem>
              ))}
            </motion.div>
          </SubmissionList>
        )}
      </SectionCard>
    </HistoryContainer>
  );
}

export default SubmissionHistory;
