// FormBuilder.jsx
import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from '../../services/api';

// Styled Components
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
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const SecondaryButton = styled(Button)`
  background-color: #e2e8f0;
  color: #4a5568;

  &:hover {
    background-color: #cbd5e0;
  }
`;

const QuestionContainer = styled(motion.div)`
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4299e1;
`;

const OptionInput = styled(Input)`
  margin-bottom: 0.75rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1.5rem 0;
`;

const QuestionTitle = styled.h3`
  color: #4a5568;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FieldTypeSelect = styled.select`
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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  cursor: pointer;
`;

const CheckboxInput = styled.input`
  margin-right: 0.5rem;
`;

const SuccessModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
`;

const URLBox = styled.div`
  background: #f7fafc;
  padding: 1rem;
  border-radius: 0.375rem;
  margin: 1rem 0;
  word-break: break-all;
`;

const RadioLabel = styled(CheckboxLabel)``;
const RadioInput = styled(CheckboxInput)``;

// Animation variants
const questionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  },
  exit: { opacity: 0, x: -20 }
};

function FormBuilder() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    fields: [
      { 
        id: "field1",
        question: "",
        type: "short_answer",
        options: [],
        required: false
      }
    ]
  });

  const [viewMode, setViewMode] = useState("create"); // 'create' or 'submissions'
  const [submissions, setSubmissions] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const navigate = useNavigate();

  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...form.fields];
    updatedFields[index][field] = value;
    setForm({ ...form, fields: updatedFields });
  };

  const addField = () => {
    setForm({
      ...form,
      fields: [
        ...form.fields,
        { 
          id: `field${form.fields.length + 1}`,
          question: "",
          type: "short_answer",
          options: [],
          required: false
        }
      ]
    });
  };

  const removeField = (index) => {
    if (form.fields.length <= 1) return;
    const updatedFields = [...form.fields];
    updatedFields.splice(index, 1);
    setForm({ ...form, fields: updatedFields });
  };

  const addOption = (fieldIndex) => {
    const updatedFields = [...form.fields];
    updatedFields[fieldIndex].options.push("");
    setForm({ ...form, fields: updatedFields });
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...form.fields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setForm({ ...form, fields: updatedFields });
  };

  const handleOptionChange = (fieldIndex, optionIndex, value) => {
    const updatedFields = [...form.fields];
    updatedFields[fieldIndex].options[optionIndex] = value;
    setForm({ ...form, fields: updatedFields });
  };

const submitForm = async () => {
  try {
    const response = await axios.post(`${BASE_URL}forms`, form);
    if (response.data && response.data.id) {
      const url = `${window.location.origin}/forms/${response.data.id}`;
      setFormUrl(url);
      setShowSuccessModal(true);
      resetForm(); // Clear the form fields
      
      try {
        await navigator.clipboard.writeText(url);
      } catch (clipboardErr) {
        console.log('Failed to copy URL to clipboard', clipboardErr);
      }
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error("Error saving form:", error);
    alert(`Failed to save form: ${error.response?.data?.message || error.message}`);
  }
};

  const fetchSubmissions = async () => {
    try {
      // In a real app, you would fetch submissions for this specific form
      const response = await axios.get(`${BASE_URL}form-submissions`);
      setSubmissions(response.data);
      setViewMode("submissions");
    } catch (error) {
      console.error("Error fetching submissions:", error);
      alert("Failed to fetch submissions");
    }
  };

  const resetForm = () => {
  setForm({
    title: "",
    description: "",
    fields: [
      { 
        id: "field1",
        question: "",
        type: "short_answer",
        options: [],
        required: false
      }
    ]
  });
};

  return (
    
    <Container>
      <Title>
        {viewMode === "create" ? "📋 Create Form" : "📊 Form Submissions"}
      </Title>

      {viewMode === "create" ? (
        <>
          <FormGroup>
            <Label>Form Title</Label>
            <Input 
              placeholder="Enter form title" 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea 
              placeholder="Enter form description" 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
            />
          </FormGroup>

          <Divider />

          <h3 style={{ color: '#4a5568', marginBottom: '1.5rem' }}>Form Fields</h3>

          <AnimatePresence>
            {form.fields.map((field, idx) => (
              <QuestionContainer
                key={field.id}
                variants={questionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <QuestionTitle>
                  <span>Field {idx + 1}</span>
                  {form.fields.length > 1 && (
                    <Button 
                      onClick={() => removeField(idx)}
                      style={{ 
                        backgroundColor: '#f56565', 
                        padding: '0.25rem 0.5rem', 
                        fontSize: '0.875rem',
                        marginLeft: 'auto'
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      Remove
                    </Button>
                  )}
                </QuestionTitle>

                <FormGroup>
                  <Label>Question Text</Label>
                  <Input 
                    value={field.question} 
                    onChange={e => handleFieldChange(idx, "question", e.target.value)} 
                    placeholder="Enter your question here..."
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Field Type</Label>
                  <FieldTypeSelect 
                    value={field.type} 
                    onChange={e => handleFieldChange(idx, "type", e.target.value)}
                  >
                    <option value="short_answer">Short Answer</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                  </FieldTypeSelect>
                </FormGroup>

                {(field.type === "multiple_choice" || field.type === "checkboxes" || field.type === "dropdown") && (
                  <>
                    <Label>Options</Label>
                    {field.options.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <OptionInput
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={e => handleOptionChange(idx, i, e.target.value)}
                        />
                        <Button 
                          onClick={() => removeOption(idx, i)}
                          style={{ 
                            backgroundColor: '#f56565', 
                            padding: '0.25rem 0.5rem', 
                            fontSize: '0.875rem',
                            marginLeft: '0.5rem'
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <SecondaryButton onClick={() => addOption(idx)}>
                      + Add Option
                    </SecondaryButton>
                  </>
                )}

                <FormGroup>
                  <CheckboxLabel>
                    <CheckboxInput
                      type="checkbox"
                      checked={field.required}
                      onChange={e => handleFieldChange(idx, "required", e.target.checked)}
                    />
                    Required
                  </CheckboxLabel>
                </FormGroup>
              </QuestionContainer>
            ))}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <SecondaryButton 
              onClick={addField}
              whileHover={{ scale: 1.05 }}
            >
              + Add Field
            </SecondaryButton>

            <div>
              <Button 
                onClick={submitForm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Form
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <Button 
              onClick={() => setViewMode("create")}
              whileHover={{ scale: 1.05 }}
            >
              ← Back to Form Editor
            </Button>
          </div>

          {submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
              <p>No submissions yet</p>
            </div>
          ) : (
            <div>
              <h3 style={{ color: '#4a5568', marginBottom: '1.5rem' }}>Submissions ({submissions.length})</h3>
              
              {submissions.map((submission, idx) => (
                <QuestionContainer key={idx}>
                  <h4>Submission #{idx + 1}</h4>
                  <p>Submitted on: {new Date(submission.timestamp).toLocaleString()}</p>
                  
                  {Object.entries(submission.answers).map(([question, answer]) => (
                    <div key={question} style={{ marginBottom: '1rem' }}>
                      <p><strong>{question}</strong></p>
                      {Array.isArray(answer) ? (
                        <ul>
                          {answer.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{answer}</p>
                      )}
                    </div>
                  ))}
                </QuestionContainer>
              ))}
            </div>
          )}
        </>
      )}
      {showSuccessModal && (
        <SuccessModal>
          <ModalContent>
            <h3>Form Saved Successfully!</h3>
            <p>Share this URL to collect responses:</p>
            <URLBox>{formUrl}</URLBox>
            <p>URL has been copied to your clipboard.</p>
            <Button 
                onClick={() => {
                    setShowSuccessModal(false);
                    resetForm(); // Additional reset when closing modal
                }}
              whileHover={{ scale: 1.05 }}
            >
              Close
            </Button>
          </ModalContent>
        </SuccessModal>
      )}
    </Container>
  );
}

export default FormBuilder;