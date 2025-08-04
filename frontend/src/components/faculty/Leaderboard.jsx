// components/Faculty/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../../services/api';

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
`;

const Title = styled.h2`
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  padding-bottom: 0.75rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 2px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 2rem;
`;

const TableHeader = styled.thead`
  background: linear-gradient(90deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
`;

const TableRow = styled(motion.tr)`
  transition: all 0.2s ease;
  position: relative;
  
  &:nth-child(even) {
    background-color: #f8fafc;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    z-index: 1;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #334155;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  border-bottom: none;
  
  &:first-child {
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }
  
  &:last-child {
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

const TableCell = styled.td`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  font-weight: ${props => props.strong ? '600' : '400'};
  color: ${props => props.strong ? '#1e293b' : '#475569'};
`;

const RankBadge = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
  background: ${props => {
    if (props.rank === 1) return 'linear-gradient(135deg, #f59e0b, #fbbf24)';
    if (props.rank === 2) return 'linear-gradient(135deg, #94a3b8, #cbd5e1)';
    if (props.rank === 3) return 'linear-gradient(135deg, #f97316, #fb923c)';
    return '#e2e8f0';
  }};
  box-shadow: ${props => {
    if (props.rank === 1) return '0 4px 12px rgba(245, 158, 11, 0.3)';
    if (props.rank === 2) return '0 4px 12px rgba(148, 163, 184, 0.3)';
    if (props.rank === 3) return '0 4px 12px rgba(249, 115, 22, 0.3)';
    return 'none';
  }};
  
  ${props => props.rank <= 3 && `
    &::after {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: 50%;
      border: 2px solid ${props.rank === 1 ? '#f59e0b' : props.rank === 2 ? '#94a3b8' : '#f97316'};
      opacity: 0.3;
      animation: pulse 2s infinite;
    }
  `}
`;

const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1.5rem;
`;

const LoadingSpinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 5px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
`;

const ErrorContainer = styled(motion.div)`
  padding: 1.5rem;
  background-color: #fff5f5;
  color: #dc2626;
  border-radius: 12px;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #dc2626;
`;

const ErrorIcon = styled.div`
  flex-shrink: 0;
`;

const ErrorText = styled.div`
  font-weight: 500;
`;

const TrophyIcon = styled.div`
  color: #f59e0b;
`;

const ScoreHighlight = styled(motion.div)`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  background: linear-gradient(90deg, #ecfdf5, #d1fae5);
  color: #065f46;
  font-weight: 600;
`;

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}leaderboard`);
        setLeaderboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch leaderboard data:", err);
        setError(err.response?.data?.message || "Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  if (loading) {
    return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Title>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Leaderboard
        </Title>
        <LoadingContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoadingSpinner />
          <LoadingText>Loading leaderboard data...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Title>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V11M12 15H12.01M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Leaderboard
        </Title>
        <ErrorContainer initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
          <ErrorIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </ErrorIcon>
          <ErrorText>{error}</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Title>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 9V12M12 12V15M12 12H9M12 12H15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 7H8M12 7H11M15 7H14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Leaderboard
      </Title>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Rank</TableHeaderCell>
            <TableHeaderCell>Student Name</TableHeaderCell>
            <TableHeaderCell>Student ID</TableHeaderCell>
            <TableHeaderCell>Quiz Score</TableHeaderCell>
            <TableHeaderCell>Assignment Score</TableHeaderCell>
            <TableHeaderCell>Combined Score</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {leaderboardData.map((Student, index) => (
            <TableRow 
              key={Student.user_id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
            >
              <TableCell>
                <RankBadge 
                  rank={index + 1}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {index + 1}
                </RankBadge>
              </TableCell>
              <TableCell strong>{Student.student_name}</TableCell>
              <TableCell>{Student.user_id}</TableCell>
              <TableCell>{Student.total_quiz_score}</TableCell>
              <TableCell>{Student.total_assignment_score}</TableCell>
              <TableCell>
                <ScoreHighlight
                  whileHover={{ scale: 1.05 }}
                >
                  {Student.combined_score}
                </ScoreHighlight>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Leaderboard;