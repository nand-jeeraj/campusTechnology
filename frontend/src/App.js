import React from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import ScheduleQuiz from "./components/quiz/ScheduleQuiz";
import TakeQuiz from "./components/quiz/TakeQuiz";
import TakeAssignment from "./components/assignment/TakeAssignment";
import SubmitAssignment from "./components/assignment/SubmitAssignment";
import ScheduleAssignment from './components/assignment/ScheduleAssignment';
import FacultyDashboard from "./components/faculty/FacultyDashboard";
import SubmissionHistory from "./components/student/SubmissionHistory";
import Scheduler from "./components/faculty/Scheduler";
import { createGlobalStyle } from "styled-components";
import QuizAssignmentManagement from "./components/faculty/QuizAssignmentManagement";
import Leaderboard from "./components/faculty/Leaderboard";
import LandingPage from "./LandingPage";
import FormBuilder from "./components/form/FormBuilder";
import FormFiller from "./components/form/FormFiller";
import FormSubmissions from "./components/form/FormSubmissions";

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    height: 100%;
    overflow: auto !important;
  }
`;

// Styled Components
const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2d3748;
`;

const AppHeader = styled(motion.h1)`
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

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const DashboardButton = styled(Link)`
  position: absolute;
  top: 1rem;
  right: 6rem; /* Adjust this value based on your layout */
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

  &:hover {
    background: #2b6cb0;
    transform: translateY(-1px);
  }

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

// Icons
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

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ManageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7L12 12L21 7L12 2Z"></path>
    <path d="M3 17L12 22L21 17"></path>
    <path d="M3 12L12 17L21 12"></path>
  </svg>
);

const ScheduleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const LeaderboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="18" y1="8" x2="23" y2="13"></line>
    <line x1="23" y1="8" x2="18" y2="13"></line>
  </svg>
);

const FormIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

function App() {
  const userRole = localStorage.getItem("user_role") || "Student";
  const location = useLocation();

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

    const showHeaderRoutes = [
    "/",
    "/take-quiz",
    "/assignments",
    "/history",
    "/leaderboard",
    "/schedule-quiz",
    "/schedule-assignment",
    "/Faculty",
    "/scheduler",
    "/manage-quizzes-assignments",
    "/form-builder",
    "/form-submissions"
  ];

  const shouldShowHeader = showHeaderRoutes.some(route => 
    location.pathname === route || 
    (route === "/form-submissions" && location.pathname.startsWith("/form-submissions"))
  ) && !location.pathname.startsWith("/forms/");

  return (
    <AppContainer>
      {!location.pathname.startsWith("/forms/") && (
  <>
      <RoleBadge role={userRole}>{userRole}</RoleBadge>
      <DashboardButton to="/">
        <DashboardIcon />
        Main Dashboard
      </DashboardButton>
      </>
      )}
      {location.pathname !== "/" && shouldShowHeader && (
        <>
          <AppHeader
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Quiz & Assignment Portal
          </AppHeader>
          
          <Navigation>
            {/* Student Links */}
            {userRole === "Student" && (
              <>
                <CustomLink to="/take-quiz" icon={QuizIcon}>Take Quiz</CustomLink>
                <CustomLink to="/assignments" icon={AssignmentIcon}>Submit Assignment</CustomLink>
                <CustomLink to="/history" icon={HistoryIcon}>My Submissions</CustomLink>
                <CustomLink to="/leaderboard" icon={LeaderboardIcon}>Leaderboard</CustomLink>
              </>
            )}
            
            {/* Faculty Links */}
            {userRole === "Faculty" && (
              <>
                <CustomLink to="/schedule-quiz" icon={ScheduleIcon}>Schedule Quiz</CustomLink>
                <CustomLink to="/schedule-assignment" icon={ScheduleIcon}>Schedule Assignment</CustomLink>
                <CustomLink to="/Faculty" icon={DashboardIcon}>Dashboard</CustomLink>
                <CustomLink to="/scheduler" icon={ScheduleIcon}>Scheduler</CustomLink>
                <CustomLink to="/manage-quizzes-assignments" icon={ManageIcon}>Manage Content</CustomLink>
                <CustomLink to="/leaderboard" icon={LeaderboardIcon}>Leaderboard</CustomLink>
                <CustomLink to="/form-builder" icon={FormIcon}>Form Builder</CustomLink>
                <CustomLink to="/form-submissions" icon={FormIcon}>Form Submissions</CustomLink>
              </>
            )}
          </Navigation>
        </>
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          
          {/* Student Routes */}
          {userRole === "Student" && (
            <>

              <Route path="/take-quiz" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <TakeQuiz />
                </motion.div>
              } />
              <Route path="/assignments" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <TakeAssignment />
                </motion.div>
              } />
              <Route path="/history" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <SubmissionHistory />
                </motion.div>
              } />
              <Route path="/leaderboard" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <Leaderboard />
                </motion.div>
              } />
              <Route path="/quiz-assignment" element={
                <Navigate to="/take-quiz" replace />
              } />
            </>
          )}

          {/* Faculty Routes */}
          {userRole === "Faculty" && (
            <>
              <Route path="/schedule-quiz" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <ScheduleQuiz />
                </motion.div>
              } />
              <Route path="/schedule-assignment" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <ScheduleAssignment />
                </motion.div>
              } />
              <Route path="/Faculty" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <FacultyDashboard />
                </motion.div>
              } />
              <Route path="/scheduler" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <Scheduler />
                </motion.div>
              } />
              <Route path="/manage-quizzes-assignments" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <QuizAssignmentManagement />
                </motion.div>
              } />
              <Route path="/leaderboard" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <Leaderboard />
                </motion.div>
              } />
              <Route path="/form-builder" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <FormBuilder />
                </motion.div>
              } />
              <Route path="/form-submissions" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <FormSubmissions />
                </motion.div>
              } />
              <Route path="/form-submissions/:formId" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <FormSubmissions />
                </motion.div>
              } />
              <Route path="/forms/:formId" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <FormFiller />
                </motion.div>
              } />
              <Route path="/quiz-assignment" element={
                <Navigate to="/schedule-quiz" replace />
              } />
            </>
          )}
        </Routes>
      </AnimatePresence>
    </AppContainer>
  );
}

export default App;