import { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../services/api';

// Styled Components
const PageContainer = styled.div`
  background: linear-gradient(to bottom right, #f7fafc, #ebf8ff);
  min-height: 100vh;
  padding: 2rem 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const MeetingsCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.p`
  text-align: center;
  color: #718096;
  padding: 2rem;
`;

const MeetingsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
`;

const TableHeader = styled.thead`
  background-color: #ebf8ff;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f7fafc;
  }
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #ebf8ff;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  color: #2b6cb0;
  font-weight: 600;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
`;

const JoinLink = styled.a`
  color: #4299e1;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: #ebf8ff;
  display: inline-block;

  &:hover {
    background-color: #bee3f8;
    color: #2b6cb0;
  }
`;

export default function StudentMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMeetings = async () => {
    try {
      const response = await fetch(`${BASE_URL}meetings`);
      const data = await response.json();
      setMeetings(data);
    } catch (err) {
      console.error("Error loading meetings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  return (
    <PageContainer>
      <ContentContainer>
        <MeetingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Title>Upcoming Meetings</Title>
          
          {loading ? (
            <LoadingSpinner>
              <Spinner />
            </LoadingSpinner>
          ) : meetings.length === 0 ? (
            <EmptyState>No meetings scheduled</EmptyState>
          ) : (
            <MeetingsTable>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Time</TableHeaderCell>
                  <TableHeaderCell>Join</TableHeaderCell>
                </tr>
              </TableHeader>
              <tbody>
                {meetings.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell>{m.title}</TableCell>
                    <TableCell>{new Date(m.time).toLocaleString()}</TableCell>
                    <TableCell>
                      <JoinLink 
                        href={m.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Join Meeting
                      </JoinLink>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </MeetingsTable>
          )}
        </MeetingsCard>
      </ContentContainer>
    </PageContainer>
  );
}