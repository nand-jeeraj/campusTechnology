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
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const RatingsCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const RatingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const RatingItem = styled(motion.div)`
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: #f7fafc;
  border-left: 4px solid #4299e1;
`;

const CourseName = styled.p`
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  margin: 0.5rem 0;
`;

const Star = styled.span`
  color: ${props => props.filled ? "#F6AD55" : "#e2e8f0"};
  font-size: 1.25rem;
`;

const CommentText = styled.p`
  color: #4a5568;
  line-height: 1.5;
  margin-top: 0.75rem;
`;

const EmptyState = styled.p`
  color: #718096;
  text-align: center;
  padding: 2rem;
`;

export default function FacultyViewCourseRatings() {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const role = localStorage.getItem("user_role");
      const name = localStorage.getItem("user_name");
      console.log("Sending headers:", {
    "x-user-role": role,
    "x-user-name": name
  });
      try {
        const response = await fetch(`${BASE_URL}faculty-course-ratings`, {
          headers: {
            "x-user-role": role,
            "x-user-name": name
          }
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setRatings(data);
        } else {
          console.error("Unexpected response:", data);
          setRatings([]);  // or show error message
        }
      } catch (err) {
        console.error("Error fetching ratings", err);
        setRatings([]);  // safe fallback
      }
    };
    fetchData();
  }, []);

  return (
    <PageContainer>
      <ContentContainer>
        <RatingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Title>Course Ratings</Title>
          
          <RatingsList>
            {ratings.length === 0 ? (
              <EmptyState>No ratings yet.</EmptyState>
            ) : (
              ratings.map((r, i) => (
                <RatingItem
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <CourseName>{r.course_name}</CourseName>
                  
                  <StarsContainer>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} filled={star <= r.rating}>
                        ★
                      </Star>
                    ))}
                  </StarsContainer>
                  
                  <CommentText>{r.comment}</CommentText>
                </RatingItem>
              ))
            )}
          </RatingsList>
        </RatingsCard>
      </ContentContainer>
    </PageContainer>
  );
}