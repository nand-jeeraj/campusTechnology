// FormFiller.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from '../../services/api';

// Reuse styled components from FormBuilder.jsx
const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled(motion.h2)`
  color: #2b6cb0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Description = styled.p`
  color: #4a5568;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
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
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 1rem;
  margin-top: 0.5rem;

  &:hover {
    background-color: #3182ce;
  }
`;

const QuestionContainer = styled.div`
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4299e1;
`;

const RequiredIndicator = styled.span`
  color: #e53e3e;
  margin-left: 0.25rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  cursor: pointer;
`;

const CheckboxInput = styled.input`
  margin-right: 0.5rem;
`;

const RadioLabel = styled(CheckboxLabel)``;
const RadioInput = styled(CheckboxInput)``;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const SuccessMessage = styled.div`
  background: #f0fff4;
  border-left: 4px solid #38a169;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

function FormFiller() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`${BASE_URL}forms/${formId}`);
        setForm(response.data);
        
        // Initialize answers object
        const initialAnswers = {};
        response.data.fields.forEach(field => {
          if (field.type === 'checkboxes') {
            initialAnswers[field.question] = [];
          } else {
            initialAnswers[field.question] = '';
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError("Failed to load form. It may not exist or is no longer available.");
        console.error("Error fetching form:", err);
      }
    };

    fetchForm();
  }, [formId]);

  const handleInputChange = (question, value) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleCheckboxChange = (question, option, isChecked) => {
    setAnswers(prev => {
      const currentValues = prev[question] || [];
      let newValues;
      
      if (isChecked) {
        newValues = [...currentValues, option];
      } else {
        newValues = currentValues.filter(item => item !== option);
      }
      
      return {
        ...prev,
        [question]: newValues
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate required fields
    if (form) {
      const missingRequiredFields = form.fields
        .filter(field => field.required)
        .filter(field => {
          const answer = answers[field.question];
          return answer === '' || (Array.isArray(answer) && answer.length === 0);
        });

      if (missingRequiredFields.length > 0) {
        setError(`Please fill in all required fields: ${missingRequiredFields.map(f => f.question).join(', ')}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await axios.post(`${BASE_URL}forms/${formId}/submit`, {
        form_id: formId,
        answers: answers,
        timestamp: new Date().toISOString()
      });
      setSubmitSuccess(true);
    } catch (err) {
      setError("Failed to submit form. Please try again.");
      console.error("Error submitting form:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <Container>
        <Title>Error</Title>
        <p>{error}</p>
      </Container>
    );
  }

  if (!form) {
    return (
      <Container>
        <Title>Loading Form...</Title>
      </Container>
    );
  }

  if (submitSuccess) {
    return (
      <Container>
        <SuccessMessage>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#38a169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Your response has been recorded!
        </SuccessMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>{form.title}</Title>
      {form.description && <Description>{form.description}</Description>}

      <form onSubmit={handleSubmit}>
        {form.fields.map((field, index) => (
          <QuestionContainer key={field.id}>
            <FormGroup>
              <Label>
                {field.question}
                {field.required && <RequiredIndicator>*</RequiredIndicator>}
              </Label>
              
              {field.type === 'short_answer' && (
                <Input
                  type="text"
                  value={answers[field.question] || ''}
                  onChange={(e) => handleInputChange(field.question, e.target.value)}
                  placeholder="Your answer"
                />
              )}

              {field.type === 'paragraph' && (
                <TextArea
                  value={answers[field.question] || ''}
                  onChange={(e) => handleInputChange(field.question, e.target.value)}
                  placeholder="Your answer"
                />
              )}

              {field.type === 'multiple_choice' && (
                <div>
                  {field.options.map((option, i) => (
                    <RadioLabel key={i}>
                      <RadioInput
                        type="radio"
                        name={field.question}
                        value={option}
                        checked={answers[field.question] === option}
                        onChange={() => handleInputChange(field.question, option)}
                      />
                      {option}
                    </RadioLabel>
                  ))}
                </div>
              )}

              {field.type === 'checkboxes' && (
                <div>
                  {field.options.map((option, i) => (
                    <CheckboxLabel key={i}>
                      <CheckboxInput
                        type="checkbox"
                        checked={answers[field.question]?.includes(option) || false}
                        onChange={(e) => handleCheckboxChange(field.question, option, e.target.checked)}
                      />
                      {option}
                    </CheckboxLabel>
                  ))}
                </div>
              )}

              {field.type === 'dropdown' && (
                <Select
                  value={answers[field.question] || ''}
                  onChange={(e) => handleInputChange(field.question, e.target.value)}
                >
                  <option value="">Select an option</option>
                  {field.options.map((option, i) => (
                    <option key={i} value={option}>{option}</option>
                  ))}
                </Select>
              )}
            </FormGroup>
          </QuestionContainer>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Container>
  );
}

export default FormFiller;