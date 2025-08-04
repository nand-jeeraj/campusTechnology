import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";

// Styled Components
const AppContainer = styled.div`
  min-height: 90vh;
  background: linear-gradient(to bottom right, #f7fafc, #ebf8ff);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const Navigation = styled.nav`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-top: 8rem; /* Added margin to push navbar below top-right buttons */
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;
`;

const NavLink = styled(Link)`
  color: #4a5568;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #2b6cb0;
    background: #ebf8ff;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #4299e1;
    transition: width 0.3s ease;
  }

  &:hover::before {
    width: 100%;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ActiveNavLink = styled(NavLink)`
  color: #2b6cb0;
  font-weight: 600;

  &::before {
    width: 100%;
  }
`;

// Top-right buttons container
const TopRightButtons = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

// Dashboard button styled exactly like in LandingPage.js
const DashboardButton = styled(motion.button)`
  background: white;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  font-weight: 500;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    color: #2b6cb0;
  }
`;

const IconWrapper = styled.div`
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ebf8ff;
  border-radius: 50%;
  color: #4299e1;
`;

const RoleBadge = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  font-weight: 500;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BadgeIconWrapper = styled(IconWrapper)`
  background: ${props => props.role === "Faculty" ? "#FEEBC8" : "#C6F6D5"};
  color: ${props => props.role === "Faculty" ? "#DD6B20" : "#38A169"};
`;

// Icons (remain the same as before)
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
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

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const FaceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <path d="M20 8v6"></path>
    <path d="M23 11h-6"></path>
  </svg>
);

const CustomLink = ({ to, children, icon: Icon, location }) => {
  const isActive = location.pathname === to;
  const LinkComponent = isActive ? ActiveNavLink : NavLink;
  
  return (
    <LinkComponent to={to}>
      {Icon && <Icon />}
      {children}
    </LinkComponent>
  );
};

export default function AttendanceNav() {
  const location = useLocation();
  const userRole = localStorage.getItem("user_role") || "Student";

  const handleDashboardClick = (e) => {
    e.preventDefault();
    window.location.href = "/"; // Force full page reload to main dashboard
  };

  return (
    <AppContainer>
      <HeaderContainer>
        <TopRightButtons>
          <DashboardButton 
            as="a"
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDashboardClick}
          >
            <IconWrapper>
              <DashboardIcon />
            </IconWrapper>
            Main Dashboard
          </DashboardButton>
          
          <RoleBadge>
            <BadgeIconWrapper role={userRole}>
              {userRole === "Faculty" ? <FacultyIcon /> : <StudentIcon />}
            </BadgeIconWrapper>
            {userRole === "Faculty" ? "Faculty" : "Student"}
          </RoleBadge>
        </TopRightButtons>
      </HeaderContainer>

      <Navigation>
        <CustomLink to="/attendance" icon={UploadIcon} location={location}>Upload</CustomLink>
        <CustomLink to="/attendance/history" icon={HistoryIcon} location={location}>History</CustomLink>
        <CustomLink to="/attendance/dashboard" icon={DashboardIcon} location={location}>Dashboard</CustomLink>
        <CustomLink to="/attendance/add-face" icon={FaceIcon} location={location}>Add Face</CustomLink>
      </Navigation>
      
      <Outlet />
    </AppContainer>
  );
}