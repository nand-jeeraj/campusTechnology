import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { BASE_URL } from '../../services/api';

// Styled Components
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled(motion.h2)`
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.8rem;
`;

const AssignmentCard = styled(motion.div)`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.$isTimed ? "#f6ad55" : "#4299e1"};
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: #ebf8ff;
    transform: translateY(-2px);
  }
`;

const AssignmentTitle = styled.h3`
  color: #2d3748;
  margin: 0;
  font-size: 1.2rem;
`;

const AssignmentMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
`;

const AssignmentTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: ${props => props.$isActive ? "#38a169" : props.$isUpcoming ? "#d69e2e" : "#e53e3e"};
`;

const Button = styled(motion.button)`
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #3182ce;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: #e2e8f0;
  color: #2d3748;
  margin-right: 1rem;

  &:hover {
    background: #cbd5e0;
  }
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const QuestionText = styled.p`
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;

  &:hover {
    background: #ebf8ff;
    border-color: #bee3f8;
  }
`;

const RadioInput = styled.input`
  margin-right: 1rem;
  accent-color: #4299e1;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1.5rem 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  color: #718096;
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const ProgressDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? "#4299e1" : "#e2e8f0"};
  transition: all 0.2s ease;
`;

const TimerContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
`;

const WarningBanner = styled.div`
  background-color: #fffaf0;
  border-left: 4px solid #dd6b20;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StrictBanner = styled.div`
  background-color: #fff5f5;
  border-left: 4px solid #e53e3e;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FullscreenWarning = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #e53e3e;
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;

const RetakeModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ExplanationContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0fff4;
  border-radius: 8px;
  border-left: 4px solid #38a169;
`;

const ExplanationTitle = styled.h4`
  color: #2f855a;
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExplanationText = styled.p`
  color: #2d3748;
  margin-bottom: 0;
`;

const ExplanationBox = styled.div`
  background: #f0f9ff;
  border-left: 4px solid #4299e1;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 0 4px 4px 0;
  font-size: 0.95rem;
  color: #2d3748;
`;

const CorrectAnswer = styled.div`
  color: #38a169;
  font-weight: bold;
  margin: 0.5rem 0;
`;

const IncorrectAnswer = styled.div`
  color: #e53e3e;
  font-weight: bold;
  margin: 0.5rem 0;
`;

const FileDownloadButton = styled(Button)`
  background: #38a169;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #2f855a;
  }
`;

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function TakeAssignment() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [assignmentStartTime, setAssignmentStartTime] = useState(null);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [retakeReason, setRetakeReason] = useState("");
  const [userId, setUserId] = useState("");
  const [attempts, setAttempts] = useState({});
  const fullscreenHandle = useFullScreenHandle();
  const [showResults, setShowResults] = useState(false);
  const [explanations, setExplanations] = useState({});
  const [isLoadingExplanations, setIsLoadingExplanations] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [hasViewedResults, setHasViewedResults] = useState(false);
  const [fileSubmissions, setFileSubmissions] = useState({});

const handleDownloadFile = async (assignmentId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}download-file-assignment/${assignmentId}`,
      {
        responseType: 'blob',
      }
    );

    // Create blob from response data
    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });

    // Extract filename from content-disposition or use default
    let filename = 'assignment_file';
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const matches = /filename="?([^"]+)"?/g.exec(disposition);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    // Create download link and trigger click
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    console.error("Error downloading file:", error);
    alert(`Failed to download file: ${error.response?.data?.detail || error.message}`);
  }
};

const handleFileUpload = async (assignmentId, file) => {
  if (!file) {
    alert("Please select a file to upload");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    
    await axios.post(
      `${BASE_URL}submit-file-assignment/${assignmentId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }
    );
    
    alert("File submitted successfully!");
    setFileSubmissions(prev => ({
      ...prev,
      [assignmentId]: "submitted"
    }));
  } catch (error) {
    console.error("Error submitting file:", error);
    alert("Failed to submit file: " + (error.response?.data?.message || error.message));
  }
};

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id') || `Student_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('assignmentUserId', storedUserId);
    setUserId(storedUserId);

    const rawAttempts = localStorage.getItem('assignmentAttempts');
    const parsedAttempts = rawAttempts ? JSON.parse(rawAttempts) : {};
    if (!parsedAttempts[storedUserId]) {
      parsedAttempts[storedUserId] = {};
      localStorage.setItem('assignmentAttempts', JSON.stringify(parsedAttempts));
    }
    setAttempts(parsedAttempts[storedUserId]);

 // Only fetch from working endpoints
  Promise.all([
    axios.get(`${BASE_URL}assignments`),
    axios.get(`${BASE_URL}scheduled-assignments`)
  ])
    .then(([quizzesRes, scheduledQuizzesRes]) => {
      setAssignments([...quizzesRes.data, ...scheduledQuizzesRes.data]);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      // If scheduled-quizzes fails, just load regular quizzes
      axios.get(`${BASE_URL}quizzes`)
        .then(res => setAssignments(res.data))
        .catch(err => {
          console.error("Failed to fetch quizzes:", err);
          setAssignments([]);
        });
    });
}, []);

  

const handleAutoSubmit = useCallback(() => {
  if (isSubmitting) return;

  setIsSubmitting(true);
  const formattedAnswers = {};
  selectedAssignment.questions.forEach(q => {
    if (q.options) {
      formattedAnswers[q.question] = {
        selected_option: answers[q.question] || "",
        text: answers[q.question] || ""
      };
    } else {
      formattedAnswers[q.question] = answers[q.question] || "";
    }
  });

  const payload = {
    user_id: userId,
    assignment_id: selectedAssignment._id,
    assignment_title: selectedAssignment.title,
    answers: formattedAnswers,
    auto_submitted: true,
    retake_reason: "Time expired"
  };

  axios.post(`${BASE_URL}submit-assignment`, payload)
    .then(res => {
      setSubmissionResult(res.data.result);
      alert(`⏰ Time's up! Auto-submitted. Score: ${res.data.result.score}`);
      fetchExplanations(payload, selectedAssignment);
      setShowResults(true);
      setHasViewedResults(false);
      handleAssignmentCompletion(selectedAssignment._id);
    })
    .catch(err => {
      console.error("Auto-submission error:", err);

      let errorMessage = "Auto submission failed";

      // ✅ This block handles all error formats
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          errorMessage = err.response.data.detail;
        } else if (typeof err.response.data.detail === "object") {
          errorMessage = err.response.data.detail.message || JSON.stringify(err.response.data.detail);
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`❌ ${errorMessage}`);
    })
    .finally(() => setIsSubmitting(false));
}, [answers, isSubmitting, selectedAssignment, userId]);


useEffect(() => {
  if (!selectedAssignment || !selectedAssignment.duration_minutes || !assignmentStartTime) return;

  const timer = setInterval(() => {
    const now = new Date();
    const endTime = new Date(assignmentStartTime.getTime() + selectedAssignment.duration_minutes * 60000);
    const diff = endTime - now;

    if (diff <= 0) {
      clearInterval(timer);
      if (!isSubmitting && !showResults) {  // Add these checks
        handleAutoSubmit();
      }
      return;
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setTimeLeft(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
  }, 1000);

  return () => clearInterval(timer);
}, [selectedAssignment, assignmentStartTime, handleAutoSubmit, isSubmitting, showResults]); // Add dependencies

  useEffect(() => {
    if (!selectedAssignment || !selectedAssignment.duration_minutes) return;

    const handleFullscreenChange = () => {
      setShowFullscreenWarning(!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [selectedAssignment]);

  const checkAttempts = (assignmentId) => {
    const assignmentAttempts = attempts[assignmentId] || 0;
    const assignment = assignments.find((q) => q._id === assignmentId);

    if (assignmentAttempts > 0 && !assignment?.allow_retakes) {
      setSelectedAssignment(assignment);
      setShowRetakeModal(true);
      return false;
    }
    return true;
  };

  const handleSelect = async (assignment) => {
    console.log("Selected assignment:", assignment);
    if (!assignment?._id) {
      console.error("Assignment object missing _id:", assignment);
      alert("Error: Selected assignment is missing ID");
      return;
    }

    const canProceed = checkAttempts(assignment._id);
    if (!canProceed) return;

    const now = new Date();
    if (assignment.start_time && assignment.end_time) {
      const startTime = new Date(assignment.start_time);
      const endTime = new Date(assignment.end_time);

      if (now < startTime) {
        alert("This assignment hasn't started yet. Please come back later.");
        return;
      }

      if (now > endTime) {
        alert("This assignment has already ended.");
        return;
      }
    }

    const shuffledAssignment = {
        ...assignment,
        questions: shuffleArray(assignment.questions.map(question => {
          if (question.options) {
            return {
              ...question,
              options: shuffleArray(question.options)
            };
          }
          return question;
        }))
      };

    if (assignment.duration_minutes) {
      try {
        await fullscreenHandle.enter();
        setAssignmentStartTime(now);
      } catch (err) {
        alert("Fullscreen is required for this timed assignment.");
        return;
      }
    }

    setSelectedAssignment(shuffledAssignment);
    setAnswers({});
    setShowResults(false);
    setHasViewedResults(false);
    setSubmissionResult(null);
  };

  const handleChange = (questionText, value) => {
    setAnswers(prev => ({ ...prev, [questionText]: value }));
  };

  const handleAssignmentCompletion = (assignmentId) => {
    if (!assignmentId) return;

    const updatedUserAttempts = {
      ...attempts,
      [assignmentId]: (attempts[assignmentId] || 0) + 1,
    };

    setAttempts(updatedUserAttempts);

    const fullAttempts = JSON.parse(localStorage.getItem("assignmentAttempts")) || {};
    fullAttempts[userId] = updatedUserAttempts;
    localStorage.setItem("assignmentAttempts", JSON.stringify(fullAttempts));
  };

const fetchExplanations = async (submissionData, assignmentData) => {
  setIsLoadingExplanations(true);
  
  try {
    // Prepare all questions for batch explanation
    const explanationRequests = assignmentData.questions.map(question => {
      const userAnswer = submissionData.answers[question.question]?.text || 
                        submissionData.answers[question.question]?.selected_option || 
                        submissionData.answers[question.question] || "";
      
      return {
        question: question.question,
        user_answer: userAnswer,
        correct_answer: question.answer,
        question_type: question.options ? "mcq" : "descriptive"
      };
    });

    // Send all questions in one request
    const response = await axios.post(`${BASE_URL}explain-answers`, {
      questions: explanationRequests
    });
    
    // Create explanations map from the response
    const explanationsMap = {};
    response.data.explanations.forEach((explanation, index) => {
      explanationsMap[assignmentData.questions[index].question] = explanation;
    });
    
    setExplanations(explanationsMap);
  } catch (err) {
    console.error("Error fetching explanations:", err);
    alert("Couldn't load explanations. Please try again later.");
  } finally {
    setIsLoadingExplanations(false);
  }
};

  const handleBackToAssignments = () => {
    setShowResults(false);
    setSelectedAssignment(null);
    setAnswers({});
    setExplanations({});
    setSubmissionResult(null);
    
    if (document.fullscreenElement) {
      fullscreenHandle.exit().catch(err => {
        console.log("Error exiting fullscreen:", err);
      });
    }
  };

  const handleSubmit = async () => {
    const unanswered = selectedAssignment.questions.filter(q => 
      !answers[q.question] || answers[q.question].trim() === ""
    );
    
    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    setIsSubmitting(true);

    const formattedAnswers = {};
    selectedAssignment.questions.forEach(q => {
      if (q.options) {
        formattedAnswers[q.question] = {
          selected_option: answers[q.question],
          text: answers[q.question]
        };
      } else {
        formattedAnswers[q.question] = {
          text: answers[q.question],
          selected_option: null
        }
      }
    });

    if (!selectedAssignment?._id) {
      console.error("Missing assignment_id in selectedAssignment:", selectedAssignment);
      alert("Error: Assignment ID is missing. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      user_id: userId,
      assignment_id: selectedAssignment._id,
      assignment_title: selectedAssignment.title,
      answers: formattedAnswers,
      auto_submitted: false,
      retake_reason: retakeReason || ""
    };

    console.log("Submitting payload:", payload);

    axios.post(`${BASE_URL}submit-assignment`, payload)
      .then(res => {
        setSubmissionResult(res.data.result);
        const message = selectedAssignment.questions.some(q => !q.options) ?
          "✅ Submitted! Your multiple-choice answers have been graded. Descriptive answers will be AI." :
          `✅ Submitted! Your score: ${res.data.result.score}/${res.data.result.total_questions}`;
        
        alert(message);

        fetchExplanations(payload, selectedAssignment);
        setShowResults(true);
        setHasViewedResults(false);

        handleAssignmentCompletion(selectedAssignment._id);
        setRetakeReason("");
      })
      .catch(err => {
        console.error("Submission error:", err);
        
        let errorMessage = "Submission failed";
        if (err.response) {
          if (err.response.data?.detail?.message) {
            errorMessage = err.response.data.detail.message;
          } else if (err.response.data?.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data?.error) {
            errorMessage = err.response.data.error;
          } else {
            errorMessage = `Server error: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage = "No response from server";
        } else {
          errorMessage = err.message || "Request setup error";
        }
        
        alert(`❌ Error: ${errorMessage}`);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleBack = () => {
    if (window.confirm("Are you sure you want to leave? Your progress will be lost.")) {
      handleAssignmentCompletion(selectedAssignment?._id);
      handleBackToAssignments();
    }
  };

  const getAssignmentStatus = (assignment) => {
    if (!assignment.start_time || !assignment.end_time) return { status: "available" };
    
    const now = new Date();
    const startTime = new Date(assignment.start_time);
    const endTime = new Date(assignment.end_time);

    if (now < startTime) return { status: "upcoming", text: `Starts: ${startTime.toLocaleString()}` };
    if (now > endTime) return { status: "ended", text: "Ended" };
    return { status: "active", text: `Ends: ${endTime.toLocaleString()}` };
  };

  const handleRetakeConfirm = () => {
    if (!retakeReason.trim()) {
      alert("Please provide a reason for retaking the assignment.");
      return;
    }
    setShowRetakeModal(false);
    handleSelect(selectedAssignment);
  };

  const markResultsAsViewed = () => {
    setHasViewedResults(true);
  };

  if (selectedAssignment) {
    if (showResults) {
      return (
        <Container>
          <Title>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Assignment Results
          </Title>
          
          {submissionResult && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
              <h3>Score Summary</h3>
              <p>You scored {submissionResult.score} out of {submissionResult.total_questions}</p>
            </div>
          )}
          
          {isLoadingExplanations ? (
            <div>Loading explanations...</div>
          ) : (
            selectedAssignment.questions.map((q, i) => {
              const userAnswer = answers[q.question];
              const isCorrect = q.options ? userAnswer === q.answer : false;
              
              return (
                <QuestionContainer key={i}>
                  <QuestionText><b>Question {i + 1}:</b> {q.question}</QuestionText>
                  
                  <div style={{ margin: "0.5rem 0" }}>
                    <strong>Your answer:</strong> 
                    {isCorrect ? (
                      <CorrectAnswer>{userAnswer || "No answer provided"}</CorrectAnswer>
                    ) : (
                      <IncorrectAnswer>{userAnswer || "No answer provided"}</IncorrectAnswer>
                    )}
                  </div>
                  
                  {q.options && (
                    <div style={{ margin: "0.5rem 0" }}>
                      <strong>Correct answer:</strong> 
                      <CorrectAnswer>{explanations[q.question] ? q.answer : ""}</CorrectAnswer>
                    </div>
                  )}
                  
                  <ExplanationBox>
                    {explanations[q.question] || "Explanation not available"}
                  </ExplanationBox>
                  
                  {i < selectedAssignment.questions.length - 1 && <Divider />}
                </QuestionContainer>
              );
            })
          )}
          
          <ButtonGroup>
            <Button 
              onClick={() => {
                markResultsAsViewed();
                handleBackToAssignments();
              }}
            >
              ← Back to Assignments
            </Button>
          </ButtonGroup>
        </Container>
      );
    }

    return (
      <div>
        {showFullscreenWarning && selectedAssignment.duration_minutes && (
          <FullscreenWarning>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V11M12 15H12.01M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Warning: You must be in fullscreen mode for this timed assignment
          </FullscreenWarning>
        )}

        <FullScreen handle={fullscreenHandle}>
          <Container>
            <Title initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17L12 22L21 17" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12L12 17L21 12" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {selectedAssignment.title}
              {selectedAssignment.duration_minutes && (
                <span style={{ marginLeft: 'auto', fontSize: '1rem', color: '#4a5568' }}>
                  Duration: {selectedAssignment.duration_minutes} mins
                </span>
              )}
            </Title>

            {selectedAssignment.duration_minutes && timeLeft && (
              <TimerContainer>
                Time Remaining: {timeLeft}
              </TimerContainer>
            )}

            {selectedAssignment.duration_minutes ? (
              <WarningBanner>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V11M12 15H12.01M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="#DD6B20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                This is a timed assignment. It will auto-submit when time runs out.
              </WarningBanner>
            ) : (
              <StrictBanner>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V11M12 15H12.01M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                This is a strict assignment. You can only take it once.
              </StrictBanner>
            )}

            <ProgressIndicator>
              {selectedAssignment.questions.map((_, i) => (
                <ProgressDot key={i} active={Object.keys(answers).length >= i} />
              ))}
            </ProgressIndicator>

            {selectedAssignment.questions.map((q, i) => (
              <QuestionContainer key={i}>
                <QuestionText><b>Question {i + 1}:</b> {q.question}</QuestionText>
                {q.options ? (
                  (q.options || []).map((opt, idx) => (
                    <OptionLabel key={idx}>
                      <RadioInput
                        type="radio"
                        name={q.question}
                        value={opt}
                        checked={answers[q.question] === opt}
                        onChange={e => handleChange(q.question, e.target.value)}
                      />
                      {opt}
                    </OptionLabel>
                  ))
                ) : (
                  <TextArea
                    placeholder="Type your answer here..."
                    value={answers[q.question] || ""}
                    onChange={e => handleChange(q.question, e.target.value)}
                  />
                )}
                {i < selectedAssignment.questions.length - 1 && <Divider />}
              </QuestionContainer>
            ))}

            <ButtonGroup>
              <SecondaryButton 
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back to Assignments
              </SecondaryButton>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(answers).length !== selectedAssignment.questions.length}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? "Submitting..." : "Submit Assignment"}
              </Button>
            </ButtonGroup>
          </Container>
        </FullScreen>

        {showRetakeModal && (
          <RetakeModal>
            <ModalContent>
              <h3>Retake Assignment Request</h3>
              <p>You've already taken this assignment. Please provide a valid reason why you need to retake it:</p>
              <TextArea
                placeholder="Explain why you need to retake this assignment..."
                value={retakeReason}
                onChange={(e) => setRetakeReason(e.target.value)}
              />
              <ModalActions>
                <SecondaryButton onClick={() => setShowRetakeModal(false)}>
                  Cancel
                </SecondaryButton>
                <Button onClick={handleRetakeConfirm}>
                  Submit Request
                </Button>
              </ModalActions>
            </ModalContent>
          </RetakeModal>
        )}
      </div>
    );
  }

return (
  <Container>
    <Title initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Available Assignments
    </Title>

    {assignments.length === 0 ? (
      <EmptyState initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p>No assignments available at the moment</p>
      </EmptyState>
    ) : (
      assignments.map((assignment, idx) => {
        const { status, text } = getAssignmentStatus(assignment);
        const isTimed = assignment.duration_minutes;
        const attemptsCount = attempts[assignment._id] || 0;
        const buttonText = attemptsCount > 0 ? 
          (hasViewedResults ? "Retake" : "Check your Answer") : 
          "Start Assignment";
        const isFileAssignment = assignment.isFileAssignment;

        return (
          <AssignmentCard 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            $isTimed={isTimed}
          >
            <div>
              <AssignmentTitle>{assignment.title}</AssignmentTitle>
              <AssignmentMeta>
                {assignment.start_time && assignment.end_time ? (
                  <AssignmentTime $isActive={status === "active"} $isUpcoming={status === "upcoming"}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {text}
                  </AssignmentTime>
                ) : (
                  <div>Regular Assignment</div>
                )}
                {isTimed && (
                  <div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6V12L16 14" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Duration: {assignment.duration_minutes} mins
                  </div>
                )}
                {isFileAssignment && (
                  <div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="13 2 13 9 20 9" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    File Assignment
                  </div>
                )}
                {attemptsCount > 0 && (
                  <div style={{ color: '#e53e3e' }}>
                    Attempts: {attemptsCount}
                  </div>
                )}
              </AssignmentMeta>
            </div>

            {isFileAssignment ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <FileDownloadButton 
                  onClick={() => handleDownloadFile(assignment._id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </FileDownloadButton>
                
                <input 
                  type="file" 
                  id={`file-upload-${assignment._id}`}
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(assignment._id, e.target.files[0])}
                />
                <label htmlFor={`file-upload-${assignment._id}`}>
                  <SecondaryButton
                    as="span"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {fileSubmissions[assignment._id] ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Resubmit
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Upload
                      </>
                    )}
                  </SecondaryButton>
                </label>
              </div>
            ) : (
              <Button 
                onClick={() => {
                  if (attemptsCount > 0 && !hasViewedResults) {
                    setSelectedAssignment(assignment);
                    setShowResults(true);
                  } else {
                    handleSelect(assignment);
                  }
                }}
                disabled={status === "upcoming" || status === "ended" || (attemptsCount > 0 && !assignment.allow_retakes && hasViewedResults)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status === "upcoming" ? "Upcoming" : 
                status === "ended" ? "Ended" : 
                buttonText}
              </Button>
            )}
          </AssignmentCard>
        );
      })
    )}
  </Container>
);
}

export default TakeAssignment;