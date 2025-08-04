import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

// Wrapper
const NavbarWrapper = styled.div`
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 10;
`;

// Container
const NavbarContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

// Logo
const LogoTitle = styled(motion.h1)`
  font-size: 2.5rem;
  color: #2b6cb0;
  margin-bottom: 2rem;
  text-align: center;
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

// Badge & Main Dashboard Button
const RoleBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => props.role === 'Faculty' ? '#f56565' : '#48bb78'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const DashboardButton = styled.div`
  position: absolute;
  top: 1rem;
  right: 6rem;
  background: #4299e1;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #2b6cb0;
    transform: translateY(-1px);
    cursor: pointer;
  }

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

// Navigation styling
const Navigation = styled.nav`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
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
  white-space: nowrap;

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

const NavButton = styled.button`
  background: transparent;
  border: none;
  color: #4a5568;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #2b6cb0;
    background: #ebf8ff;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

// Icons
const DiscussionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const AnnouncementIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const MeetingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const FeedbackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const RatingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const OneWayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ImportantIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const RateCourseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

// Main Navbar Component
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("");

  useEffect(() => {
    const r = localStorage.getItem("user_role");
    setRole(r);
  }, []);

  const CustomLink = ({ to, children, icon: Icon }) => {
    const isActive = location.pathname === to;
    const LinkComponent = isActive ? ActiveNavLink : NavLink;

    return (
      <LinkComponent to={to}>
        {Icon && <Icon />}
        {children}
      </LinkComponent>
    );
  };

  const handleDashboardClick = () => {
    window.location.href = "/"; // Replace with your actual dashboard URL
  };

  return (
    <NavbarWrapper>
      <NavbarContainer>
        <LogoTitle
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          LMS Portal
        </LogoTitle>

        <Navigation>
          {(role === "Faculty" || role === "Student") && (
            <CustomLink to="/discussions" icon={DiscussionIcon}>
              Discussion Board
            </CustomLink>
          )}

          {role === "Faculty" && (
            <>
              <NavButton onClick={() => navigate("/faculty-announcements")}>
                <OneWayIcon />
                One-Way Discussion
              </NavButton>
              <CustomLink to="/meetings" icon={MeetingIcon}>
                Meetings
              </CustomLink>
              <NavButton onClick={() => navigate("/feedbacks")}>
                <FeedbackIcon />
                Feedback
              </NavButton>
              <NavButton onClick={() => navigate("/view-course-ratings")}>
                <RatingIcon />
                View Course Ratings
              </NavButton>
            </>
          )}

          {role === "Student" && (
            <>
              <NavButton onClick={() => navigate("/Student-announcements")}>
                <ImportantIcon />
                Important Discussion
              </NavButton>
              <CustomLink to="/smeetings" icon={MeetingIcon}>
                Meetings
              </CustomLink>
              <NavButton onClick={() => navigate("/feedback")}>
                <FeedbackIcon />
                Faculty Feedback
              </NavButton>
              <NavButton onClick={() => navigate("/rate-course")}>
                <RateCourseIcon />
                Rate Course
              </NavButton>
            </>
          )}
        </Navigation>
      </NavbarContainer>

      {/* Fixed Buttons */}
      <DashboardButton onClick={handleDashboardClick}>
        <DashboardIcon />
        Main Dashboard
      </DashboardButton>

      <RoleBadge role={role}>{role}</RoleBadge>
    </NavbarWrapper>
  );
}