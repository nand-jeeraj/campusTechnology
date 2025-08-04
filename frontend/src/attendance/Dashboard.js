import React, { useEffect, useState } from "react";
import api from "../services/api";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../services/api';
import axios from "axios";

// Loading animation keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Card = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const EmptyState = styled.p`
  color: #718096;
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.thead`
  background-color: #ebf8ff;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f7fafc;
  }
  &:hover {
    background-color: #e6fffa;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  color: #2d3748;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
`;

const StudentCell = styled(TableCell)`
  font-weight: 500;
  color: #2b6cb0;
`;

const CountCell = styled(TableCell)`
  font-weight: 600;
  color: #38a169;
  text-align: right;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 153, 225, 0.2);
  border-radius: 50%;
  border-top-color: #4299e1;
  animation: ${spin} 1s ease-in-out infinite;
  margin: 2rem auto;
`;

const SummaryCard = styled.div`
  background: #ebf8ff;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SummaryItem = styled.div`
  text-align: center;
  flex: 1;
`;

const SummaryLabel = styled.p`
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const SummaryValue = styled.h3`
  color: #2b6cb0;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, totalAttendance: 0 });

  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE_URL}api/attendance_dashboard`)
      .then((res) => {
        setData(res.data);
        // Calculate stats
        const totalStudents = res.data.length;
        const totalAttendance = res.data.reduce((sum, item) => sum + item.count, 0);
        setStats({ totalStudents, totalAttendance });
      })
      .catch((err) => console.error("Failed to load dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Title>Attendance Dashboard</Title>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <SummaryCard>
              <SummaryItem>
                <SummaryLabel>Total Students</SummaryLabel>
                <SummaryValue>{stats.totalStudents}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Total Attendance</SummaryLabel>
                <SummaryValue>{stats.totalAttendance}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Avg. Attendance</SummaryLabel>
                <SummaryValue>
                  {stats.totalStudents > 0 
                    ? (stats.totalAttendance / stats.totalStudents).toFixed(1) 
                    : 0}
                </SummaryValue>
              </SummaryItem>
            </SummaryCard>

            {data.length === 0 ? (
              <EmptyState>No attendance data available.</EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell style={{ textAlign: 'right' }}>Attendance Count</TableHeaderCell>
                  </tr>
                </TableHeader>
                <tbody>
                  {data.map((d, idx) => (
                    <TableRow key={idx}>
                      <StudentCell>{d._id}</StudentCell>
                      <CountCell>{d.count}</CountCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Card>
    </Container>
  );
}