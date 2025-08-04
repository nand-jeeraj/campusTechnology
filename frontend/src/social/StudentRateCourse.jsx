import { useState } from "react";
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

const FormContainer = styled.div`
  max-width: 32rem;
  margin: 0 auto;
`;

const FormCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const FormTitle = styled.h1`
  color: #2b6cb0;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const RatingLabel = styled.p`
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StarButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.active ? "#ED8936" : "#cbd5e0"};
  font-size: 1.5rem;
  padding: 0.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background-color: #3182ce;
  }
`;

export default function StudentSubmitCourseRating() {
  const [courseName, setCourseName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const showAlert = (message, type) => {
    alert(`${type}: ${message}`);
  };

  const submitRating = async () => {
    if (!courseName.trim() || rating === 0) {
      showAlert("Please enter course name and rating", "Warning");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}course-ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_name: courseName,
          comment,
          rating,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit rating");

      showAlert("Rating submitted", "Success");
      setCourseName("");
      setComment("");
      setRating(0);
    } catch (err) {
      showAlert("Failed to submit", "Error");
      console.error(err);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FormTitle>Rate a Course</FormTitle>
          
          <FormGroup>
            <Input
              type="text"
              placeholder="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
            
            <div>
              <RatingLabel>Your Rating:</RatingLabel>
              <StarsContainer>
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarButton
                    key={i}
                    onClick={() => setRating(i)}
                    active={i <= rating}
                    aria-label={`Rate ${i} star`}
                  >
                    ★
                  </StarButton>
                ))}
              </StarsContainer>
            </div>
            
            <TextArea
              placeholder="Write your feedback..."
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            
            <SubmitButton
              onClick={submitRating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit Rating
            </SubmitButton>
          </FormGroup>
        </FormCard>
      </FormContainer>
    </PageContainer>
  );
}