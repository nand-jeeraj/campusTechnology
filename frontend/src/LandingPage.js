import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";

const LandingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  color: #2b6cb0;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(90deg, #4299e1, #48bb78);
    border-radius: 2px;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
`;

const DashboardButton = styled(motion.button)`
  background: white;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  font-weight: 500;
  color: #4a5568;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 150px;
  text-decoration: none;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    color: #2b6cb0;
  }
`;

const IconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ebf8ff;
  border-radius: 50%;
  color: #4299e1;
`;

const QuizIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const AssignmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

const AttendanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <path d="M17 11h4m-2 2v-4"></path>
  </svg>
);

const DiscussionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const FacultyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const StudentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline points="17 11 19 13 23 9"></polyline>
  </svg>
);


function LandingPage() {
  const userRole = localStorage.getItem("user_role") || "Student";
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated");
    if (!isAuthenticated) {
      window.location.href = "/auth"; // force redirect
    }
  }, []);

  return (
    <LandingContainer>
      <Title
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Campus Technology
      </Title>
      
      <DashboardGrid>
        {/* Quiz and Assignment - visible to all */}
        <DashboardButton 
          as={Link} 
          to="/quiz-assignment"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconWrapper>
            <QuizIcon />
          </IconWrapper>
          Quiz and Assignment
        </DashboardButton>
        
        {/* Faculty-only buttons */}
        {userRole === "Faculty" && (
          <>
            <DashboardButton 
            as="a"
            href="/attendance"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/attendance";
              }}
            >
              <IconWrapper>
                <AttendanceIcon />
              </IconWrapper>
              Attendance
            </DashboardButton>

        <DashboardButton 
          as="a"  // Use anchor tag instead of Link
          href="/social"  // Use href instead of to
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/discussions";
          }}
        >
          <IconWrapper>
            <DiscussionIcon />
          </IconWrapper>
          Social & Collaboration
        </DashboardButton>
          </>
        )}
        
        {/* Student-only buttons */}
        {userRole === "Student" && (
        <DashboardButton 
          as="a"  // Use anchor tag instead of Link
          href="/social"  // Use href instead of to
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/discussions";
          }}
        >
          <IconWrapper>
            <DiscussionIcon />
          </IconWrapper>
          Social & Collaboration
        </DashboardButton>
        )}
        
        {/* Common buttons can be added here */}
        <DashboardButton 
          as="a"
          href="/profile"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/profile";
          }}
        >
          <IconWrapper>
            {userRole === "Faculty" ? <FacultyIcon /> : <StudentIcon />}
          </IconWrapper>
          {userRole === "Faculty" ? "Faculty Profile" : "Student Profile"}
        </DashboardButton>

        <DashboardButton 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/auth/login-options"; // redirect after logout
          }}
        >
          <IconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0118 0" />
            </svg>
          </IconWrapper>
          Log Out
        </DashboardButton>

      </DashboardGrid>
    </LandingContainer>
  );
}

export default LandingPage;