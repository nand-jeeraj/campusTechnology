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
  font-size: 2.5rem;
  color: #2b6cb0;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`;

const Section = styled(motion.section)`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  color: #4a5568;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyMessage = styled(motion.p)`
  color: #718096;
  font-style: italic;
  text-align: center;
  padding: 1rem;
`;

const SubmissionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SubmissionItem = styled(motion.li)`
  background: #f7fafc;
  border-left: 4px solid #4299e1;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: #ebf8ff;
    transform: translateX(5px);
  }
`;

const UserInfo = styled.span`
  font-weight: 600;
  color: #2b6cb0;
`;

const TitleInfo = styled.span`
  color: #4a5568;
`;

const ScoreBadge = styled.span`
  background: ${props => props.score >= 70 ? '#48bb78' : props.score >= 50 ? '#ed8936' : '#f56565'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
`;

const LoadingSkeleton = styled(motion.div)`
  background: #e2e8f0;
  border-radius: 0.25rem;
  height: 3rem;
  margin-bottom: 0.75rem;
`;

const ScorePill = styled.span`
  background: ${props => {
    if (props.score >= 80) return '#38a169';
    if (props.score >= 60) return '#dd6b20';
    return '#e53e3e';
  }};
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
  min-width: 80px;
  text-align: center;
`;

const DateText = styled.span`
  color: #4a5568;
  font-size: 0.875rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  flex: 1;
  min-width: 200px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const FilterDropdown = styled.div`
  position: relative;
  min-width: 200px;
`;

const DropdownButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  cursor: pointer;
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    border-color: #cbd5e0;
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
  width: 100%;
  z-index: 10;
  padding: 0.5rem;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const DropdownOption = styled.div`
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.25rem;

  &:hover {
    background: #ebf8ff;
  }
`;

const PercentageInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  width: 100%;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: #4299e1;
  }
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

function FacultyDashboard() {
  const [submissions, setSubmissions] = useState({ quizzes: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [quizSearchTerm, setQuizSearchTerm] = useState('');
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [quizPercentageFilter, setQuizPercentageFilter] = useState(null);
  const [assignmentPercentageFilter, setAssignmentPercentageFilter] = useState(null);
  const [quizCustomPercentage, setQuizCustomPercentage] = useState('');
  const [assignmentCustomPercentage, setAssignmentCustomPercentage] = useState('');
  const [quizDropdownOpen, setQuizDropdownOpen] = useState(false);
  const [assignmentDropdownOpen, setAssignmentDropdownOpen] = useState(false);
const [viewingFile, setViewingFile] = useState(null);
const [fileContent, setFileContent] = useState(null);
const [marks, setMarks] = useState({});
const [totalMarks, setTotalMarks] = useState({});

// Fetch assignment details including total marks
const fetchAssignmentDetails = async (assignmentId) => {
  try {
    const response = await axios.get(`${BASE_URL}assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignment details:", error);
    return null;
  }
};

// Handle viewing files
const handleViewFile = async (fileId, type) => {
  try {
    const endpoint = type === 'faculty' 
      ? `${BASE_URL}download-assignment-file/${fileId}`
      : `${BASE_URL}download-submission-file/${fileId}`;
      
    const response = await axios.get(endpoint, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] 
    });
    const fileUrl = URL.createObjectURL(blob);
    
    // Open in new tab
    window.open(fileUrl, '_blank');
  } catch (error) {
    console.error("Error viewing file:", error);
    alert(`Failed to view file: ${error.response?.data?.detail || error.message}`);
  }
};

// Handle marking submissions
const handleMarkSubmission = async (submissionId, assignmentId, userId) => {
  console.log("handleMarkSubmission called with:", { submissionId, assignmentId, userId });

  const mark = marks[submissionId];
  console.log("Retrieved mark:", mark);

  if (!mark || isNaN(mark)) {
    alert("Please enter a valid mark");
    console.warn("Invalid mark input detected:", mark);
    return;
  }

  try {
    console.log("Sending mark to backend:", parseFloat(mark));
    const response = await axios.post(`${BASE_URL}grade-assignment`, {
      submission_id: submissionId,
      assignment_id: assignmentId,
      user_id: userId,
      marks: parseFloat(mark)
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("Grade submission response:", response.data);
    alert("Marks submitted successfully!");

    // Refresh data
    console.log("Fetching updated assignment submissions...");
    const submissionsResponse = await axios.get(`${BASE_URL}assignment-submissions`);
    console.log("Updated submissions received:", submissionsResponse.data);

    setSubmissions(prev => ({ ...prev, assignments: submissionsResponse.data }));
  } catch (error) {
    console.error("Error occurred during mark submission:", {
      message: error.message,
      response: error.response?.data
    });
    
    let errorMessage = "Failed to submit marks";
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.detail.message) {
        errorMessage = error.response.data.detail.message;
      }
    }
    alert(errorMessage);
  }
};

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizRes, assignmentRes] = await Promise.all([
        axios.get(`${BASE_URL}submissions`),
        axios.get(`${BASE_URL}assignment-submissions`)
      ]);

      // Fetch assignment details for each submission
      const assignmentsWithDetails = await Promise.all(
        assignmentRes.data.map(async (submission) => {
          const assignmentDetails = await fetchAssignmentDetails(submission.assignment_id);
          return {
            ...submission,
            isFileAssignment: assignmentDetails?.isFileAssignment || false,
            assignment_file_id: assignmentDetails?.file_id,
            totalMarks: assignmentDetails?.totalMarks || "0"
          };
        })
      );

      setSubmissions({
        quizzes: quizRes.data,
        assignments: assignmentsWithDetails
      });

      // Initialize total marks
      const marksData = {};
      assignmentsWithDetails.forEach(sub => {
        marksData[sub.assignment_id] = sub.totalMarks;
      });
      setTotalMarks(marksData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

  const filterSubmissions = (items, searchTerm, percentageFilter, customPercentage) => {
    return items.filter(item => {
      // Search filter
      const matchesSearch = 
        item.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.quiz_title || item.assignment_title).toLowerCase().includes(searchTerm.toLowerCase());
      
      // Percentage filter
      let matchesPercentage = true;
      if (percentageFilter === 'custom' && customPercentage) {
        matchesPercentage = item.percentage >= parseInt(customPercentage);
      } else if (percentageFilter === 'high') {
        matchesPercentage = item.percentage >= 80;
      } else if (percentageFilter === 'medium') {
        matchesPercentage = item.percentage >= 60 && item.percentage < 80;
      } else if (percentageFilter === 'low') {
        matchesPercentage = item.percentage < 60;
      }
      
      return matchesSearch && matchesPercentage;
    });
  };

  const filteredQuizzes = filterSubmissions(
    submissions.quizzes, 
    quizSearchTerm, 
    quizPercentageFilter, 
    quizCustomPercentage
  );

  const filteredAssignments = filterSubmissions(
    submissions.assignments, 
    assignmentSearchTerm, 
    assignmentPercentageFilter, 
    assignmentCustomPercentage
  );

  const handleQuizPercentageFilter = (filter) => {
    setQuizPercentageFilter(filter);
    setQuizDropdownOpen(false);
  };

  const handleAssignmentPercentageFilter = (filter) => {
    setAssignmentPercentageFilter(filter);
    setAssignmentDropdownOpen(false);
  };

  return (
    <DashboardContainer>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Faculty Dashboard
      </Header>
      
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SectionTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Quiz Submissions
        </SectionTitle>
        
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search quizzes..."
            value={quizSearchTerm}
            onChange={(e) => setQuizSearchTerm(e.target.value)}
          />
          <FilterDropdown>
            <DropdownButton onClick={() => setQuizDropdownOpen(!quizDropdownOpen)}>
              {quizPercentageFilter === 'high' ? 'High (≥80%)' : 
               quizPercentageFilter === 'medium' ? 'Medium (60-79%)' : 
               quizPercentageFilter === 'low' ? 'Low (<60%)' : 
               quizPercentageFilter === 'custom' ? `Custom (≥${quizCustomPercentage}%)` : 
               'Filter by percentage'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </DropdownButton>
            <DropdownContent isOpen={quizDropdownOpen}>
              <DropdownOption onClick={() => handleQuizPercentageFilter('high')}>High (≥80%)</DropdownOption>
              <DropdownOption onClick={() => handleQuizPercentageFilter('medium')}>Medium (60-79%)</DropdownOption>
              <DropdownOption onClick={() => handleQuizPercentageFilter('low')}>Low (60%)</DropdownOption>
              <DropdownOption onClick={() => handleQuizPercentageFilter('custom')}>
                Custom
                {quizPercentageFilter === 'custom' && (
                  <PercentageInput
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={quizCustomPercentage}
                    onChange={(e) => setQuizCustomPercentage(e.target.value)}
                    onClick={(e) => e.stopPropagation()}  // Add this line
                  />
                )}
              </DropdownOption>
              <DropdownOption onClick={() => handleQuizPercentageFilter(null)}>Clear filter</DropdownOption>
            </DropdownContent>
          </FilterDropdown>
        </SearchContainer>
        
        {loading ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={`quiz-skeleton-${i}`} variants={itemVariants} />
            ))}
          </motion.div>
        ) : filteredQuizzes.length === 0 ? (
          <EmptyMessage
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No quiz submissions found
          </EmptyMessage>
        ) : (
          <SubmissionList>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {filteredQuizzes.map((sub, idx) => (
                <SubmissionItem
                  key={`quiz-${idx}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <div>
                    <UserInfo>{sub.user_name}</UserInfo> - <TitleInfo>{sub.quiz_title}</TitleInfo>
                  </div>
                  <ScoreBadge score={sub.score}>Score: {sub.score} / {sub.total_questions}</ScoreBadge>
                  <ScorePill score={sub.percentage}>{sub.percentage}%</ScorePill>
                  <DateText>{new Date(sub.submitted_at).toLocaleString()}</DateText>
                </SubmissionItem>
              ))}
            </motion.div>
          </SubmissionList>
        )}
      </Section>

      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SectionTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Assignment Submissions
        </SectionTitle>
        
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search assignments..."
            value={assignmentSearchTerm}
            onChange={(e) => setAssignmentSearchTerm(e.target.value)}
          />
          <FilterDropdown>
            <DropdownButton onClick={() => setAssignmentDropdownOpen(!assignmentDropdownOpen)}>
              {assignmentPercentageFilter === 'high' ? 'High (≥80%)' : 
               assignmentPercentageFilter === 'medium' ? 'Medium (60-79%)' : 
               assignmentPercentageFilter === 'low' ? 'Low (<60%)' : 
               assignmentPercentageFilter === 'custom' ? `Custom (≥${assignmentCustomPercentage}%)` : 
               'Filter by percentage'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </DropdownButton>
            <DropdownContent isOpen={assignmentDropdownOpen}>
              <DropdownOption onClick={() => handleAssignmentPercentageFilter('high')}>High (80%)</DropdownOption>
              <DropdownOption onClick={() => handleAssignmentPercentageFilter('medium')}>Medium (60-79%)</DropdownOption>
              <DropdownOption onClick={() => handleAssignmentPercentageFilter('low')}>Low (60%)</DropdownOption>
              <DropdownOption onClick={() => handleAssignmentPercentageFilter('custom')}>
                Custom
                {assignmentPercentageFilter === 'custom' && (
                  <PercentageInput
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={assignmentCustomPercentage}
                    onChange={(e) => setAssignmentCustomPercentage(e.target.value)}
                    onClick={(e) => e.stopPropagation()}  // Add this line
                  />
                )}
              </DropdownOption>
              <DropdownOption onClick={() => handleAssignmentPercentageFilter(null)}>Clear filter</DropdownOption>
            </DropdownContent>
          </FilterDropdown>
        </SearchContainer>
        
        {loading ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={`assign-skeleton-${i}`} variants={itemVariants} />
            ))}
          </motion.div>
        ) : filteredAssignments.length === 0 ? (
          <EmptyMessage
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            No assignment submissions found
          </EmptyMessage>
        ) : (
          <SubmissionList>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {filteredAssignments.map((sub, idx) => (
                <SubmissionItem
                  key={`assign-${idx}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                <div>
                  <UserInfo>{sub.user_name}</UserInfo> - <TitleInfo>{sub.assignment_title || sub.title || 'Untitled Assignment'}</TitleInfo>
                </div>
                
                {sub.isFileAssignment ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* View Faculty file button */}
                    <button 
                      onClick={() => handleViewFile(sub.assignment_file_id, 'Faculty')}
                      style={{ 
                        background: '#4299e1', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.375rem 0.75rem', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      View Assignment
                    </button>
                    
                    {/* View Student submission button */}
                    <button 
                      onClick={() => handleViewFile(sub.file_id, 'Student')}
                      style={{ 
                        background: '#38a169', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.375rem 0.75rem', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      View Submission
                    </button>
                    
                    {/* Marks input and display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        value={marks[sub.file_id] || ''}
                        onChange={(e) => setMarks(prev => ({ ...prev, [sub.file_id]: e.target.value }))}
                        placeholder="Enter marks"
                        min="0"
                        max={totalMarks[sub.assignment_id] || 100}
                      />

                      <span> / {sub.totalMarks}</span>
                    </div>
                    
                    {/* Submit marks button */}
              <button
                onClick={() => handleMarkSubmission(sub.file_id, sub.assignment_id, sub.user_id
                )}
                style={{ 
                  background: '#d69e2e', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.375rem 0.75rem', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Grade
              </button>
                  </div>
                ) : (
                  <>
                    <ScoreBadge score={sub.score}>Score: {sub.score} / {sub.total_questions}</ScoreBadge>
                    <ScorePill score={(sub.score / sub.total_questions) * 100}>
                      {(sub.score / sub.total_questions * 100).toFixed(2)}%
                    </ScorePill>
                  </>
                )}
                
                <DateText>{new Date(sub.submitted_at).toLocaleString()}</DateText>
              </SubmissionItem>
              ))}
            </motion.div>
          </SubmissionList>
        )}
      </Section>
    </DashboardContainer>
  );
}

export default FacultyDashboard;