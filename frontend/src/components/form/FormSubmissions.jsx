// components/form/FormSubmissions.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../../services/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h2`
  color: #2c5282;  // Darker blue for better contrast
  margin-bottom: 1.5rem;
  font-size: 2rem;  // Increased size
  font-weight: 600;
  letter-spacing: -0.5px;
`;

const FormTitle = styled.h3`
  color: #2d3748;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;  // Increased size
  font-weight: 600;
  line-height: 1.3;
`;

const FormDescription = styled.p`
  color: #4a5568;  // Darker gray for better readability
  margin-bottom: 1rem;
  font-size: 1rem;  // Slightly larger
  line-height: 1.5;
`;

const SubmissionCount = styled.div`
  display: inline-flex;
  align-items: center;
  background: #ebf8ff;  // Light blue background
  color: #2b6cb0;      // Matching blue text
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 9999px;  // Pill shape
  margin-top: 1rem;
`;

const FormsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 0.75rem;  // Slightly more rounded
  padding: 1.75rem;        // More padding
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid #4299e1;
  text-decoration: none !important;  // Remove underline
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SubmissionsContainer = styled.div`
  margin-top: 2rem;
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SubmissionItem = styled.div`
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  border-radius: 0.75rem;
  background: #f7fafc;
  border-left: 4px solid #48bb78;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SubmissionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
`;

const SubmissionNumber = styled.h3`
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const SubmissionDate = styled.p`
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3182ce;
    text-decoration: none;
  }
`;

const AnswerItem = styled.div`
  margin-bottom: 1.25rem;
`;

const AnswerLabel = styled.p`
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const AnswerValue = styled.div`
  color: #2d3748;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.1rem;
`;

function FormSubmissions() {
  const { formId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (formId) {
          const [formRes, submissionsRes] = await Promise.all([
            axios.get(`${BASE_URL}forms/${formId}`),
            axios.get(`${BASE_URL}form-submissions?form_id=${formId}`)
          ]);
          setCurrentForm(formRes.data);
          setSubmissions(submissionsRes.data);
        } else {
          const res = await axios.get(`${BASE_URL}forms`);
          setForms(res.data);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setForms([]);
        setSubmissions([]);
        setCurrentForm(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId]);

  if (loading) {
    return (
      <Container>
        <Title>Loading...</Title>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Error</Title>
        <FormDescription>{error}</FormDescription>
      </Container>
    );
  }

  if (formId && currentForm) {
    return (
      <Container>
        <BackButton to="/form-submissions">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Forms
        </BackButton>
        
        <FormTitle>{currentForm.title}</FormTitle>
        {currentForm.description && (
          <FormDescription>{currentForm.description}</FormDescription>
        )}
        <SubmissionCount>
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </SubmissionCount>
        
        <SubmissionsContainer>
          {submissions.length === 0 ? (
            <EmptyState>No submissions yet for this form.</EmptyState>
          ) : (
            submissions.map((submission, idx) => (
              <SubmissionItem key={submission._id || idx}>
                <SubmissionHeader>
                  <SubmissionNumber>Submission #{idx + 1}</SubmissionNumber>
                  <SubmissionDate>
                    {new Date(submission.timestamp).toLocaleString()}
                  </SubmissionDate>
                </SubmissionHeader>
                
                {Object.entries(submission.answers).map(([question, answer]) => (
                  <AnswerItem key={question}>
                    <AnswerLabel>{question}</AnswerLabel>
                    <AnswerValue>
                      {Array.isArray(answer) ? (
                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                          {answer.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: 0 }}>{answer}</p>
                      )}
                    </AnswerValue>
                  </AnswerItem>
                ))}
              </SubmissionItem>
            ))
          )}
        </SubmissionsContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Form Submissions</Title>
      
      {forms.length === 0 ? (
        <EmptyState>No forms available.</EmptyState>
      ) : (
        <FormsGrid>
          {forms.map(form => (
            <FormCard 
              key={form._id} 
              as={Link} 
              to={`/form-submissions/${form._id}`}
            >
              <FormTitle>{form.title}</FormTitle>
              {form.description && <FormDescription>{form.description}</FormDescription>}
              <SubmissionCount>
                {form.submission_count || 0} submission{form.submission_count !== 1 ? 's' : ''}
              </SubmissionCount>
            </FormCard>
          ))}
        </FormsGrid>
      )}
    </Container>
  );
}

export default FormSubmissions;