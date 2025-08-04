import React from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";

// Styled Components
const NavContainer = styled(motion.nav)`
  background: linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%);
  padding: 1rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.5rem;
`;

const NavItem = styled(motion.li)`
  position: relative;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: #ebf8ff;
  }
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: white;
  border-radius: 3px 3px 0 0;
`;

const FacultyBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
  display: inline-flex;
  align-items: center;
`;

// Icons
const Icon = ({ name }) => {
  const icons = {
    dashboard: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    scheduler: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    quiz: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    assignment: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    history: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    )
  };

  return icons[name] || null;
};

export default function Navbar({ role }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <NavContainer
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavList>
        {role === "Faculty" && (
          <>
            <NavItem whileHover={{ y: -2 }}>
              <NavLink to="/Faculty/dashboard">
                <Icon name="dashboard" />
                Dashboard
                <FacultyBadge>Faculty</FacultyBadge>
              </NavLink>
              {isActive("/Faculty/dashboard") && (
                <ActiveIndicator layoutId="activeIndicator" />
              )}
            </NavItem>
            <NavItem whileHover={{ y: -2 }}>
              <NavLink to="/Faculty/scheduler">
                <Icon name="scheduler" />
                Scheduler
                <FacultyBadge>Faculty</FacultyBadge>
              </NavLink>
              {isActive("/Faculty/scheduler") && (
                <ActiveIndicator layoutId="activeIndicator" />
              )}
            </NavItem>
          </>
        )}
        <NavItem whileHover={{ y: -2 }}>
          <NavLink to="/take-quiz">
            <Icon name="quiz" />
            Take Quiz
          </NavLink>
          {isActive("/take-quiz") && (
            <ActiveIndicator layoutId="activeIndicator" />
          )}
        </NavItem>
        <NavItem whileHover={{ y: -2 }}>
          <NavLink to="/submit-assignment">
            <Icon name="assignment" />
            Submit Assignment
          </NavLink>
          {isActive("/submit-assignment") && (
            <ActiveIndicator layoutId="activeIndicator" />
          )}
        </NavItem>
        <NavItem whileHover={{ y: -2 }}>
          <NavLink to="/history">
            <Icon name="history" />
            History
          </NavLink>
          {isActive("/history") && (
            <ActiveIndicator layoutId="activeIndicator" />
          )}
        </NavItem>
      </NavList>
    </NavContainer>
  );
}