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
  gap: 0.75rem;
`;

const SubmissionCard = styled(motion.div)`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border-left: 4px solid #4299e1;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const SubmissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const SubmissionInfo = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #4a5568;
  min-width: 100px;
  display: inline-block;
`;

const InfoValue = styled.span`
  color: #2d3748;
  flex: 1;
`;

const ScoreBadge = styled.span`
  background: ${props => props.score >= 80 ? '#48bb78' : props.score >= 60 ? '#ed8936' : '#f56565'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
  margin-left: 0.5rem;
`;

const LoadingSkeleton = styled(motion.div)`
  background: #e2e8f0;
  border-radius: 0.5rem;
  height: 120px;
  margin-bottom: 1rem;
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
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

function FacultySubmissions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE_URL}all-submissions`)
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch submissions:", err);
        setError("Failed to fetch submissions. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardContainer>
      <Header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        All Submissions
      </Header>

      {error && (
        <EmptyState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p style={{ color: "#f56565", fontWeight: "600" }}>{error}</p>
        </EmptyState>
      )}

      {loading ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={`skeleton-${i}`} variants={cardVariants} />
          ))}
        </motion.div>
      ) : data.length === 0 ? (
        <EmptyState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p>No submissions found</p>
        </EmptyState>
      ) : (
        <SubmissionGrid>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {data.map((item, i) => (
              <SubmissionCard
                key={i}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
              >
                <SubmissionInfo>
                  <InfoLabel>User:</InfoLabel>
                  <InfoValue>{item.user_id}</InfoValue>
                </SubmissionInfo>
                <SubmissionInfo>
                  <InfoLabel>Quiz:</InfoLabel>
                  <InfoValue>{item.quiz_title}</InfoValue>
                </SubmissionInfo>
                <SubmissionInfo>
                  <InfoLabel>Score:</InfoLabel>
                  <InfoValue>
                    {item.score}
                    <ScoreBadge score={item.score}>
                      {item.score >= 80 ? 'Excellent' : item.score >= 60 ? 'Good' : 'Needs Improvement'}
                    </ScoreBadge>
                  </InfoValue>
                </SubmissionInfo>
                <SubmissionInfo>
                  <InfoLabel>Submitted:</InfoLabel>
                  <InfoValue>{new Date(item.submitted_at).toLocaleString()}</InfoValue>
                </SubmissionInfo>
              </SubmissionCard>
            ))}
          </motion.div>
        </SubmissionGrid>
      )}
    </DashboardContainer>
  );
}

export default FacultySubmissions;