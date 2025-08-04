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
  transition: all 0.3s ease;
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem auto;
  }
`;

const Title = styled(motion.h2)`
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.8rem;
`;

const QuizCard = styled(motion.div)`
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

const QuizTitle = styled.h3`
  color: #2d3748;
  margin: 0;
  font-size: 1.2rem;
`;

const QuizMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
`;

const QuizTime = styled.div`
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

/* Add these styles to your existing styled components */

/* Fullscreen container styles */
const FullScreenContainer = styled.div`
  height: 100vh;
  overflow-y: auto;
  padding: 2rem;
  background: #f8fafc;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  ${Container} {
    width: 100%;
    max-width: 1000px;
    padding: 2rem;
  }

  &:fullscreen {
    height: 100vh;
    overflow-y: auto;
  }

  &:-webkit-full-screen {
    height: 100vh;
    overflow-y: auto;
  }

  &:-moz-full-screen {
    height: 100vh;
    overflow-y: auto;
  }

  &:-ms-fullscreen {
    height: 100vh;
    overflow-y: auto;
  }
    
    ${Title} {
      font-size: 2.2rem;
      margin-bottom: 2rem;
    }
    
    ${QuizCard} {
      padding: 2rem;
      margin-bottom: 1.5rem;
    }
    
    ${QuestionContainer} {
      margin-bottom: 3rem;
    }
    
    ${QuestionText} {
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
    }
    
    ${OptionLabel} {
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
    }
    
    ${Button} {
      padding: 1rem 2rem;
      font-size: 1.1rem;
    }
    
    ${SecondaryButton} {
      padding: 1rem 2rem;
      font-size: 1.1rem;
    }
    
    ${TimerContainer} {
      font-size: 1.5rem;
      margin-bottom: 2rem;
    }
    
    ${WarningBanner}, ${StrictBanner} {
      padding: 1.5rem;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
  }
  
  /* Fallback for browsers that don't support :fullscreen pseudo-class */
  &:-webkit-full-screen {
    background: #f8fafc;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    overflow-y: auto;
    
    ${Container} {
      max-width: 1000px;
      width: 90%;
      margin: 0;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-radius: 16px;
      padding: 3rem;
      animation: ${fadeIn} 0.4s ease-out;
    }
  }
  
  &:-moz-full-screen {
    background: #f8fafc;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    overflow-y: auto;
    
    ${Container} {
      max-width: 1000px;
      width: 90%;
      margin: 0;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-radius: 16px;
      padding: 3rem;
      animation: ${fadeIn} 0.4s ease-out;
    }
  }
  
  &:-ms-fullscreen {
    background: #f8fafc;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    overflow-y: auto;
    
    ${Container} {
      max-width: 1000px;
      width: 90%;
      margin: 0;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-radius: 16px;
      padding: 3rem;
      animation: ${fadeIn} 0.4s ease-out;
    }
  }
`;

/* Add this animation */
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(66, 153, 225, 0); }
  100% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0); }
`;

/* Update the FullscreenWarning to make it more noticeable */
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
  font-size: 1.1rem;
  font-weight: 600;
  animation: ${pulse} 2s infinite;
  
  svg {
    flex-shrink: 0;
  }
`;

// Add this utility function at the top of your file
const convertUTCToIST = (utcDateString) => {
  if (!utcDateString) return '';
  
  const date = new Date(utcDateString);
  // IST is UTC+5:30
  date.setHours(date.getHours() + 5);
  date.setMinutes(date.getMinutes() + 30);
  
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function TakeQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [retakeReason, setRetakeReason] = useState("");
  const [userId, setUserId] = useState("");
  const [attempts, setAttempts] = useState({});
  const fullscreenHandle = useFullScreenHandle();

useEffect(() => {
  const storedUserId = localStorage.getItem('user_id') || `Student_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('quizUserId', storedUserId);
  setUserId(storedUserId);

const rawAttempts = localStorage.getItem('quizAttempts');
const parsedAttempts = rawAttempts ? JSON.parse(rawAttempts) : {};
if (!parsedAttempts[storedUserId]) {
  parsedAttempts[storedUserId] = {};
  localStorage.setItem('quizAttempts', JSON.stringify(parsedAttempts));
}
setAttempts(parsedAttempts[storedUserId]);


  Promise.all([
    axios.get(`${BASE_URL}quizzes`),
    axios.get(`${BASE_URL}scheduled-quizzes`)
  ])
    .then(([normalRes, scheduledRes]) => {
      setQuizzes([...normalRes.data, ...scheduledRes.data]);
    })
    .catch((err) => console.error("Fetch error:", err));
}, []);

const handleAutoSubmit = useCallback(() => {
  if (isSubmitting) return;

  setIsSubmitting(true);
  const formattedAnswers = {};
  selectedQuiz.questions.forEach(q => {
    formattedAnswers[q.question] = {
      selected_option: q.options ? answers[q.question] : null,
      text: q.options ? answers[q.question] : answers[q.question]
    };
  });

  const payload = {
    user_id: userId,
    quiz_id: selectedQuiz._id,
    quiz_title: selectedQuiz.title,
    answers: formattedAnswers,
    auto_submitted: true,
    retake_reason: "Time expired"
  };

  axios.post(`${BASE_URL}submit`, payload)
    .then(res => {
      alert(`⏰ Time's up! Auto-submitted. Score: ${res.data.result.score}`);
      handleQuizCompletion(selectedQuiz._id);
    })
    .catch(err => {
      console.error("Auto-submission error:", err);
      const errorMessage = err.response?.data?.detail || 
                         err.response?.data?.message || 
                         err.message || 
                         "Auto submission failed";
      alert(`❌ ${errorMessage}`);
    })
    .finally(() => setIsSubmitting(false));
}, [answers, isSubmitting, selectedQuiz, userId]);


  useEffect(() => {
    if (!selectedQuiz || !selectedQuiz.duration_minutes) return;
// const enterFullscreen = async () => {
//       try {
//         await fullscreenHandle.enter();
//       } catch (err) {
//         console.error("Failed to enter fullscreen:", err);
//         setShowFullscreenWarning(true);
//       }
//     };
//     enterFullscreen();

    const timer = setInterval(() => {
      const now = new Date();
      const endTime = new Date(quizStartTime.getTime() + selectedQuiz.duration_minutes * 60000);
      const diff = endTime - now;

      if (diff <= 0) {
        clearInterval(timer);
        handleAutoSubmit();
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedQuiz, quizStartTime, handleAutoSubmit, fullscreenHandle]);

  useEffect(() => {
    if (!selectedQuiz || !selectedQuiz.duration_minutes) return;

  const handleFullscreenChange = () => {
    if (selectedQuiz?.duration_minutes && !document.fullscreenElement) {
      setShowFullscreenWarning(true);
      setTimeout(() => {
      fullscreenHandle.enter().catch(err => {
        console.error("Failed to re-enter fullscreen:", err);
      });
    }, 100);
  } else {
    setShowFullscreenWarning(false)
  }
  };
const blockShortcuts = (e) => {
    // Block F11, Ctrl+Shift+I, etc.
    if (e.key === 'F11' || 
        e.key === 'f11' ||
        e.key === 'Escape' ||
        (e.key === 'PrintScreen' && (e.metaKey || e.ctrlKey || e.altKey)) || // Windows + Print Screen or other modifiers
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'R') ||
        (e.ctrlKey && e.key === 'V') ||
        (e.ctrlKey && e.key === 'v') ||
        (e.ctrlKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'v') ||
        (e.ctrlKey && e.key === 'r') ||
        (e.ctrlKey && e.key === 'P') ||
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.shiftKey && e.key === 'j') ||
        (e.ctrlKey && e.shiftKey && e.key === 'i') ||
        (e.key === 'F11' && e.getModifierState('Fn')) || // Fn + F11
        e.key === 'Escape') {
      e.preventDefault();

      setShowFullscreenWarning(true);
      setTimeout(() => {
        fullscreenHandle.enter().catch(err => {
          console.error("Failed to re-enter fullscreen:", err);
        });
      }, 100);
    }
  };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', blockShortcuts);
    return () => {  document.removeEventListener('fullscreenchange', handleFullscreenChange);
                    window.removeEventListener('keydown', blockShortcuts); 
            }
  }, [selectedQuiz, fullscreenHandle]);

const checkAttempts = (quizId) => {
  const quizAttempts = attempts[quizId] || 0;
  const quiz = quizzes.find((q) => q._id === quizId);

  if (quizAttempts > 0 && !quiz?.allow_retakes) {
    setSelectedQuiz(quiz);
    setShowRetakeModal(true);
    return false;
  }
  return true;
};


// In your handleSelect function
const handleSelect = async (quiz) => {
  console.log("Selected quiz:", quiz); // Debug log
  if (!quiz?._id) {
    console.error("Quiz object missing _id:", quiz);
    alert("Error: Selected quiz is missing ID");
    return;
  }

  const canProceed = checkAttempts(quiz._id);
  if (!canProceed) return;

  const now = new Date();
  if (quiz.start_time && quiz.end_time) {
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);

    if (now < startTime) {
      alert("This quiz hasn't started yet. Please come back later.");
      return;
    }

    if (now > endTime) {
      alert("This quiz has already ended.");
      return;
    }
  }

  const shuffledQuiz = {
    ...quiz,
    questions: shuffleArray(quiz.questions.map(question => {
      if (question.options) {
        return {
          ...question,
          options: shuffleArray(question.options)
        };
      }
      return question;
    }))
  };

  if (quiz.duration_minutes) {
    try {
      setSelectedQuiz(shuffledQuiz);
      setAnswers({});

      setTimeout(async () => {
        try {
          await fullscreenHandle.enter();
          setQuizStartTime(now);
        } catch (err) {
          alert("Fullscreen is required for this timed quiz.")
          setSelectedQuiz(null);
        }
      }, 100);

    } catch (err) {
      alert("Fullscreen is required for this timed quiz.");
      return;
    }
  }
  const blockShortcuts = (e) => {
    // Block F11, Ctrl+Shift+I, etc.
    if (e.key === 'F11' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'R')) {
      e.preventDefault();

      setShowFullscreenWarning(true);
      setTimeout(() => {
        fullscreenHandle.enter().catch(err => {
          console.error("Failed to re-enter fullscreen:", err);
        });
      }, 100);
    }
  };
  setSelectedQuiz(shuffledQuiz);
  setAnswers({});
};


  const handleChange = (questionText, value) => {
    setAnswers(prev => ({ ...prev, [questionText]: value }));
  };

  const handleQuizCompletion = (quizId) => {
  if (!quizId) return;

  const updatedUserAttempts = {
    ...attempts,
    [quizId]: (attempts[quizId] || 0) + 1,
  };

  setAttempts(updatedUserAttempts);

  const fullAttempts = JSON.parse(localStorage.getItem("quizAttempts")) || {};
  fullAttempts[userId] = updatedUserAttempts;
  localStorage.setItem("quizAttempts", JSON.stringify(fullAttempts));

  // Clear quiz state
  setSelectedQuiz(null);
  setShowFullscreenWarning(false);
  fullscreenHandle.exit();
};

const handleSubmit = () => {
  // Validate all questions are answered
  const unanswered = selectedQuiz.questions.filter(q => 
    !answers[q.question] || answers[q.question].trim() === ""
  );
  
  if (unanswered.length > 0) {
    alert(`Please answer all questions. ${unanswered.length} remaining.`);
    return;
  }

  setIsSubmitting(true);

  // Format answers appropriately for backend
  const formattedAnswers = {};
  selectedQuiz.questions.forEach(q => {
    formattedAnswers[q.question] = {
      selected_option: q.options ? answers[q.question] : null,
      text: q.options ? answers[q.question] : answers[q.question]
    };
  });

    if (!selectedQuiz?._id) {
    console.error("Missing quiz_id in selectedQuiz:", selectedQuiz);
    alert("Error: Quiz ID is missing. Please try again.");
    setIsSubmitting(false);
    return;
  }

  const payload = {
    user_id: userId,
    quiz_id: selectedQuiz._id,
    quiz_title: selectedQuiz.title,
    answers: formattedAnswers,
    auto_submitted: false,
    retake_reason: retakeReason || ""
  };

  console.log("Submitting payload:", payload); // Debugging

  axios.post(`${BASE_URL}submit`, payload)
    .then(res => {
      const message = selectedQuiz.questions.some(q => !q.options) ?
        "✅ Submitted! Your multiple-choice answers have been graded. Descriptive answers will be reviewed AI." :
        `✅ Submitted! Your score: ${res.data.result.score}/${res.data.result.total_questions}`;
      
      alert(message);
      handleQuizCompletion(selectedQuiz._id);
      setRetakeReason("");
    })
.catch(err => {
      console.error("Submission error:", err);
      
      let errorMessage = "Submission failed";
      if (err.response) {
        // The request was made and the server responded with a status code
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
        // The request was made but no response was received
        errorMessage = "No response from server";
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || "Request setup error";
      }
      
      alert(`❌ Error: ${errorMessage}`);
    })
    .finally(() => setIsSubmitting(false));
};
  const handleBack = () => {
    if (window.confirm("Are you sure you want to leave? Your progress will be lost. And in the marks report marked as 0")) {
      handleQuizCompletion(selectedQuiz?._id);
    }
  };

  const getQuizStatus = (quiz) => {
    if (!quiz.start_time || !quiz.end_time) return { status: "available" };
    
    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);

    if (now < startTime) return { status: "upcoming", text: `Starts: ${startTime.toLocaleString()}` };
    if (now > endTime) return { status: "ended", text: "Ended" };
    return { status: "active", text: `Ends: ${endTime.toLocaleString()}` };
  };

  const handleRetakeConfirm = () => {
    if (!retakeReason.trim()) {
      alert("Please provide a reason for retaking the quiz.");
      return;
    }
    setShowRetakeModal(false);
    handleSelect(selectedQuiz);
  };

  if (selectedQuiz) {
    return (
      
      <div>
        {showFullscreenWarning && selectedQuiz.duration_minutes && (
          <FullscreenWarning>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V11M12 15H12.01M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Warning: You must be in fullscreen mode for this timed quiz
          </FullscreenWarning>
        )}

        <FullScreen handle={fullscreenHandle}>
          <FullScreenContainer>
          <Container>
            <Title initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17L12 22L21 17" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12L12 17L21 12" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {selectedQuiz.title}
              {selectedQuiz.duration_minutes && (
                <span style={{ marginLeft: 'auto', fontSize: '1rem', color: '#4a5568' }}>
                  Duration: {selectedQuiz.duration_minutes} mins
                </span>
              )}
            </Title>

            {selectedQuiz.duration_minutes && timeLeft && (
              <TimerContainer>
                Time Remaining: {timeLeft}
              </TimerContainer>
            )}

            {selectedQuiz.duration_minutes ? (
              <WarningBanner>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V11M12 15H12.01M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="#DD6B20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                This is a timed quiz. It will auto-submit when time runs out.
              </WarningBanner>
            ) : (
              <StrictBanner>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V11M12 15H12.01M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                This is a strict quiz. You can only take it once.
              </StrictBanner>
            )}

            <ProgressIndicator>
              {selectedQuiz.questions.map((_, i) => (
                <ProgressDot key={i} active={Object.keys(answers).length >= i} />
              ))}
            </ProgressIndicator>

            {selectedQuiz.questions.map((q, i) => (
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
                {i < selectedQuiz.questions.length - 1 && <Divider />}
              </QuestionContainer>
            ))}

            <ButtonGroup>
              <SecondaryButton 
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back to Quizzes
              </SecondaryButton>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(answers).length !== selectedQuiz.questions.length}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            </ButtonGroup>
          </Container>
        

        {showRetakeModal && (
          <RetakeModal>
            <ModalContent>
              <h3>Retake Quiz Request</h3>
              <p>You've already taken this quiz. Please provide a valid reason why you need to retake it:</p>
              <TextArea
                placeholder="Explain why you need to retake this quiz..."
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
        </FullScreenContainer>
        </FullScreen>
      </div>


    );
  }

  return (
    <Container>
      <Title initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Available Quizzes
      </Title>

      {quizzes.length === 0 ? (
        <EmptyState initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p>No quizzes available at the moment</p>
        </EmptyState>
      ) : (
        quizzes.map((quiz, idx) => {
          const { status, text } = getQuizStatus(quiz);
          const isTimed = quiz.duration_minutes;
          const attemptsCount = attempts[quiz._id] || 0;

          {attemptsCount > 0 && (
            <div style={{ color: '#e53e3e' }}>
              Attempts: {attemptsCount}
            </div>
          )}
          
          return (
            <QuizCard 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              isTimed={isTimed}
            >
              <div>
                <QuizTitle>{quiz.title}</QuizTitle>
                <QuizMeta>
                  {quiz.start_time && quiz.end_time ? (
                    <QuizTime isActive={status === "active"} isUpcoming={status === "upcoming"}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {text}
                    </QuizTime>
                  ) : (
                    <div>Regular Quiz</div>
                  )}
                  {isTimed && (
                    <div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 6V12L16 14" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Duration: {quiz.duration_minutes} mins
                    </div>
                  )}
                  {attemptsCount > 0 && (
                    <div style={{ color: '#e53e3e' }}>
                      Attempts: {attemptsCount}
                    </div>
                  )}
                </QuizMeta>
              </div>
              <Button 
                onClick={() => handleSelect(quiz)}
                disabled={status === "upcoming" || status === "ended" || (attemptsCount > 0 && !quiz.allow_retakes)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status === "upcoming" ? "Upcoming" : 
                 status === "ended" ? "Ended" : 
                 attemptsCount > 0 ? "Retake" : "Start Quiz"}
              </Button>
            </QuizCard>
          );
        })
      )}
    </Container>
  );
}

export default TakeQuiz;