import { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../services/api';

// Styled Components
const PageContainer = styled.div`
  background: linear-gradient(to bottom right, #f7fafc, #ebf8ff);
  min-height: 100vh;
  padding: 2rem 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Title = styled(motion.h1)`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const FeedbackContainer = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  border-left: 4px solid #4299e1;
`;

const FeedbackText = styled.p`
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.5;
`;

const StudentInfo = styled.p`
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ResponseContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 0.5rem;
  border: 1px solid #bbf7d0;
`;

const ResponseLabel = styled.p`
  color: #166534;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ResponseText = styled.p`
  color: #166534;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ResponseForm = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
`;

const ResponseTextarea = styled.textarea`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  align-self: flex-start;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3182ce;
  }
`;

const RatingDisplay = styled.div`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

export default function FacultyFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [responses, setResponses] = useState({});

  const showAlert = (message, type) => {
    alert(`${type}: ${message}`);
  };

  const load = async () => {
    try {
      const response = await fetch(`${BASE_URL}feedback`);
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      showAlert("Failed to load feedbacks", "error");
    }
  };

  const respond = async (id) => {
    const text = responses[id];
    if (!text) return;

    try {
      await fetch(`${BASE_URL}feedback/${id}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: text })
      });
      showAlert("Response sent", "success");
      setResponses({ ...responses, [id]: "" });
      load();
    } catch (err) {
      showAlert("Failed to send response", "error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageContainer>
      <ContentContainer>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Student Feedbacks
        </Title>
        
        <div>
          {feedbacks.map((fb) => (
            <FeedbackContainer
              key={fb._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FeedbackText>{fb.text}</FeedbackText>
              <StudentInfo>
                <strong>Student:</strong> {fb.Student_name} <br />
                <strong>Faculty:</strong> {fb.Faculty_name}
              </StudentInfo>

              <RatingDisplay>
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} style={{ color: i <= fb.rating ? "#ECC94B" : "#CBD5E0" }}>
                    ★
                  </span>
                ))}
              </RatingDisplay>

              {fb.response ? (
                <ResponseContainer>
                  <ResponseLabel>Your response:</ResponseLabel>
                  <ResponseText>{fb.response}</ResponseText>
                </ResponseContainer>
              ) : (
                <ResponseForm>
                  <ResponseTextarea
                    placeholder="Write a response..."
                    value={responses[fb._id] || ""}
                    onChange={(e) =>
                      setResponses({ ...responses, [fb._id]: e.target.value })
                    }
                  />
                  <SubmitButton
                    onClick={() => respond(fb._id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Response
                  </SubmitButton>
                </ResponseForm>
              )}
            </FeedbackContainer>
          ))}
        </div>
      </ContentContainer>
    </PageContainer>
  );
}