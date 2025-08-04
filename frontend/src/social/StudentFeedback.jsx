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
  max-width: 32rem;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FeedbackForm = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const FormTitle = styled.h1`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  background-color: #fff;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const RatingContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const RatingLabel = styled.p`
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StarButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
  color: ${props => props.active ? "#ECC94B" : "#E2E8F0"};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const FormTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  margin-bottom: 1.5rem;
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
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3182ce;
  }
`;

export default function StudentFeedback() {
  const [text, setText] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [rating, setRating] = useState(0);

  const showAlert = (message, type) => {
    alert(`${type}: ${message}`);
  };

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const token = localStorage.getItem("token"); // make sure token is stored after login
        const response = await fetch(`${BASE_URL}users?role=faculty`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();
        setFacultyList(data);
        console.log("Faculty data:", data);
      } catch (err) {
        showAlert("Error fetching faculty list", "error");
      }
    };
    fetchFaculty();
  }, []);

const submitFeedback = async () => {
  const studentId = localStorage.getItem("user_id");

  if (!selectedFaculty || !text.trim() || rating === 0) {
    showAlert("Please select faculty, give rating and write feedback", "warning");
    return;
  }

  console.log("📤 Sending student_id:", studentId);

  try {
    const token = localStorage.getItem("token"); // Get the JWT token
    const response = await fetch(`${BASE_URL}feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // Include the token
      },
      body: JSON.stringify({
        faculty_id: selectedFaculty,
        text,
        rating,
        student_id: studentId
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    showAlert("Feedback submitted successfully", "success");
    setText("");
    setSelectedFaculty("");
    setRating(0);
  } catch (err) {
    showAlert(err.message || "Failed to submit feedback", "error");
  }
};

  return (
    <PageContainer>
      <ContentContainer>
        <FeedbackForm
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FormTitle>Give Feedback</FormTitle>
          
          <FormSelect
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            <option value="">Select Faculty</option>
            {Array.isArray(facultyList) && facultyList.map(f => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </FormSelect>

          <RatingContainer>
            <RatingLabel>Rate Faculty:</RatingLabel>
            <RatingStars>
              {[1, 2, 3, 4, 5].map((i) => (
                <StarButton
                  key={i}
                  onClick={() => setRating(i)}
                  active={i <= rating}
                  aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
                >
                  ★
                </StarButton>
              ))}
            </RatingStars>
          </RatingContainer>

          <FormTextArea
            placeholder="Write your feedback..."
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <SubmitButton
            onClick={submitFeedback}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Submit Feedback
          </SubmitButton>
        </FeedbackForm>
      </ContentContainer>
    </PageContainer>
  );
}