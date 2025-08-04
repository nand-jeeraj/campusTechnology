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
    background-color: #ebf8ff;
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

const TimestampCell = styled(TableCell)`
  white-space: nowrap;
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

const LoadingRow = styled(TableRow)`
  td {
    text-align: center;
    padding: 2rem;
  }
`;

export default function History() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${BASE_URL}api/attendance_history`)
      .then((res) => {
        setRecords(res.data);
      })
      .catch((err) => {
        console.error("Failed to load history", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Title>Attendance History</Title>

        {isLoading ? (
          <LoadingSpinner />
        ) : records.length === 0 ? (
          <EmptyState>No attendance records found.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>Student</TableHeaderCell>
                <TableHeaderCell>Timestamp</TableHeaderCell>
              </tr>
            </TableHeader>
            <tbody>
              {records.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.Student_name}</TableCell>
                  <TimestampCell>
                    {new Date(r.timestamp).toLocaleString()}
                  </TimestampCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}