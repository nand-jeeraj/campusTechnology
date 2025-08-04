import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as XLSX from 'xlsx';
import { BASE_URL } from '../../services/api';

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  color: #2d3748;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #edf2f7;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  width: 90%;
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  transition: all 0.2s;

  &:hover {
    background: #3182ce;
  }

  &.secondary {
    background: #e2e8f0;
    color: #4a5568;

    &:hover {
      background: #cbd5e0;
    }
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const QuestionContainer = styled(motion.div)`
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #4299e1;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionNumber = styled.span`
  font-weight: 600;
  color: #2d3748;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
`;

const OptionInput = styled(Input)`
  margin-left: 1.5rem;
  position: relative;

  &::before {
    content: "○";
    position: absolute;
    left: -1.5rem;
    color: #718096;
  }
`;

const AnswerInput = styled(Input)`
  margin-top: 1rem;
  font-weight: 500;
  border-color: #48bb78;

  &:focus {
    border-color: #48bb78;
    box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.2);
  }
`;

const AnswerLabel = styled.span`
  display: block;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #48bb78;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fc8181;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f0fff4;
  border-radius: 8px;
  border: 1px solid #68d391;
`;

// New styled components for AI and Upload features
const AISection = styled(motion.div)`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #bae6fd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
`;

const AISectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const AILogo = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AITitle = styled.h3`
  margin: 0;
  color: #0c4a6e;
  font-size: 1.25rem;
`;

const AIDescription = styled.p`
  margin: 0.5rem 0 1rem;
  color: #4b5563;
  font-size: 0.9rem;
`;

const AIInputContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const AIInput = styled(Input)`
  padding-right: 120px;
  background: white;
  border: 1px solid #cbd5e1;
  transition: all 0.3s ease;
  width: 60%;
  
  &:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
  }
`;

const AIGenerateButton = styled(Button)`
  position: absolute;
  right: 6px;
  top: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #d1fae5;
    cursor: not-allowed;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  span {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    display: inline-block;
    animation: bounce 1.4s infinite ease-in-out both;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { 
      transform: scale(0);
    }
    40% { 
      transform: scale(1);
    }
  }
`;

const UploadButton = styled(Button)`
  background: #9f7aea;
  color: white;

  &:hover {
    background: #805ad5;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;
const FileUploadContainer = styled.div`
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e0;
    transition: all 0.2s;
    &:hover {
    border-color: #4299e1;
    background: #f0f9ff;
  }
`;

const FileUploadTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #4a5568;
`;

const FilePreview = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileName = styled.span`
  color: #2d3748;
  font-size: 0.9rem;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
`;

// Animation variants
const questionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0, x: -20 }
};

function ScheduleAssignment() {
  const [assignment, setAssignment] = useState({
    title: "",
    questions: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = React.createRef();
  const [fileAssignment, setFileAssignment] = useState({
    title: "",
    totalMarks: "",
    file: null
  });

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFileAssignment(prev => ({
      ...prev,
      file
    }));
  }
};

const handleRemoveFile = () => {
  setFileAssignment(prev => ({
    ...prev,
    file: null
  }));
};

const handleFileSubmit = async (e) => {
  e.preventDefault();
  
  if (!fileAssignment.file || !fileAssignment.title) {
    alert("Please provide a title and select a file");
    return;
  }

  setIsSubmitting(true);
  
  try {
    const formData = new FormData();
    formData.append("title", fileAssignment.title);
    formData.append("totalMarks", fileAssignment.totalMarks || "0");
    formData.append("file", fileAssignment.file);

    const response = await axios.post(
      `${BASE_URL}upload-file-assignment`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }
    );

    // Reset form on success
    setFileAssignment({
      title: "",
      totalMarks: "",
      file: null
    });
    setSubmitSuccess(true);
    alert("File assignment uploaded successfully!");
  } catch (error) {
    console.error("Error uploading file:", error);
    setSubmitError(error.response?.data?.message || "Failed to upload file assignment");
  } finally {
    setIsSubmitting(false);
  }
};

  const addQuestion = () => {
    setAssignment((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          type: "mcq",
          question: "",
          options: ["", "", "", ""],
          answer: "",
        },
      ],
    }));
  };

  const removeQuestion = (idx) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions.splice(idx, 1);
    setAssignment({ ...assignment, questions: updatedQuestions });
  };

  const changeQuestionType = (idx, newType) => {
    const updated = [...assignment.questions];
    updated[idx].type = newType;
    if (newType === "descriptive") {
      updated[idx].options = null;
    } else {
      updated[idx].options = ["", "", "", ""];
    }
    setAssignment({ ...assignment, questions: updated });
  };

  const generateQuestionsWithAI = async () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a prompt (e.g., '5 questions for 10th grade biology about photosynthesis')");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(`${BASE_URL}generate-questions-assignment`, {
        prompt: aiPrompt
      });

      if (response.data && response.data.questions) {
        const newQuestions = response.data.questions.map((q) => ({
          type: q.question_type === "descriptive" ? "descriptive" : "mcq", // Ensure type matches select values
          question: q.question,
          options: q.options || ["", "", "", ""],
          answer: q.answer
        }));

        setAssignment(prev => ({
          ...prev,
          questions: [...prev.questions, ...newQuestions]
        }));
      } else {
        throw new Error("No questions generated");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedQuestions = jsonData.map((row, index) => {
          // Handle various column name formats
          const question = row.question || row.Question || row.QUESTION || '';
          const option1 = row.option1 || row['Option 1'] || row['OPTION 1'] || row['Option1'] || row['Option 1'] || '';
          const option2 = row.option2 || row['Option 2'] || row['OPTION 2'] || row['Option2'] || row['Option 2'] || '';
          const option3 = row.option3 || row['Option 3'] || row['OPTION 3'] || row['Option3'] || row['Option 3'] || '';
          const option4 = row.option4 || row['Option 4'] || row['OPTION 4'] || row['Option4'] || row['Option 4'] || '';
          const answer = row.answer || row['Correct Answer'] || row['CORRECT ANSWER'] || row.Answer || row.ANSWER || '';
          const type = row.type || (answer && option1 && option2 && option3 && option4 ? "mcq" : "descriptive");

          if (!question) {
            console.warn('Skipping invalid row:', row);
            return null;
          }

          const questionObj = {
            question: question.toString().trim(),
            type: type,
            answer: answer.toString().trim()
          };

          if (type === "mcq") {
            questionObj.options = [
              option1.toString().trim(),
              option2.toString().trim(),
              option3.toString().trim(),
              option4.toString().trim()
            ];
          }

          return questionObj;
        }).filter(Boolean);

        if (parsedQuestions.length === 0) {
          alert("No valid questions found in the uploaded file. Please check the format.");
          return;
        }

        setAssignment(prev => ({
          ...prev,
          questions: [...prev.questions, ...parsedQuestions]
        }));

        // Reset file input
        e.target.value = '';
      } catch (err) {
        console.error('Error processing file:', err);
        alert("Error processing the file. Please make sure it's a valid Excel file.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Clean the data before sending
      const assignmentData = {
        title: assignment.title.trim(),
        questions: assignment.questions.map(q => ({
          type: q.type,
          question: q.question.trim(),
          options: q.type === 'mcq' 
            ? q.options.map(opt => opt.trim()).filter(opt => opt !== '')
            : null,
          answer: q.answer.trim()
        })).filter(q => q.question !== '' && q.answer !== '')
      };

      // Validate at least one question exists
      if (assignmentData.questions.length === 0) {
        throw new Error("Please add at least one valid question");
      }

      // Validate MCQ questions have at least 2 options
      const invalidQuestions = assignmentData.questions.filter(q => 
        q.type === 'mcq' && (!q.options || q.options.length < 2)
      );
      if (invalidQuestions.length > 0) {
        throw new Error("MCQ questions must have at least 2 options");
      }

      const response = await axios.post(
        `${BASE_URL}create-assignment`,
        assignmentData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Reset form on success
      setAssignment({
        title: "",
        questions: [],
      });
      setSubmitSuccess(true);
      
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        setSubmitError(error.response.data.detail || error.response.data.message || "Failed to create assignment");
      } else if (error.request) {
        // The request was made but no response was received
        setSubmitError("No response from server. Please try again.");
      } else {
        // Something happened in setting up the request
        setSubmitError(error.message || "An error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <TitleContainer>
        <Title>Schedule Assignment</Title>
        <UploadButton
          onClick={handleUploadClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"> </polyline>
              <line x1="12" y1="3" x2="12" y2="15"> </line>
             </svg>
              Upload
        </UploadButton>
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload}
          accept=".xlsx,.xls,.csv"
        />
      </TitleContainer>
<FileUploadContainer>
  <FileUploadTitle>Upload File Assignment</FileUploadTitle>
  <Form onSubmit={handleFileSubmit}>
    <Input
      type="text"
      placeholder="Assignment Title"
      value={fileAssignment.title}
      onChange={(e) => setFileAssignment({...fileAssignment, title: e.target.value})}
      required
    />
    <Input
      type="number"
      placeholder="Total Marks (optional)"
      value={fileAssignment.totalMarks}
      onChange={(e) => setFileAssignment({...fileAssignment, totalMarks: e.target.value})}
      style={{ marginTop: '0.5rem' }}
    />
    
    <div style={{ marginTop: '1rem' }}>
      <UploadButton
        type="button"
        onClick={handleUploadClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Select File
      </UploadButton>
      <FileInput 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
    </div>
    
    {fileAssignment.file && (
      <FilePreview>
        <FileName>{fileAssignment.file.name}</FileName>
        <RemoveFileButton onClick={handleRemoveFile}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Remove
        </RemoveFileButton>
      </FilePreview>
    )}
    
    <Button
      type="submit"
      disabled={!fileAssignment.file || isSubmitting}
      style={{ marginTop: '1rem' }}
    >
      {isSubmitting ? 'Uploading...' : 'Upload Assignment'}
    </Button>
  </Form>
</FileUploadContainer>

      {submitError && <ErrorMessage>{submitError}</ErrorMessage>}
        {submitSuccess && (
          <SuccessMessage>
            Assignment successfully scheduled! You can now create another one.
          </SuccessMessage>
        )}

        <br></br>
      <AISection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AISectionHeader>
          <AILogo>AI</AILogo>
          <AITitle>Generate Questions with AI</AITitle>
        </AISectionHeader>
        
        <AIDescription>
          Enter a topic or concept and let our AI generate assignment questions automatically.
          Example: "5 questions about World War 2 for high school Students"
        </AIDescription>
        
        <AIInputContainer>
          <AIInput
            type="text"
            placeholder="Describe what questions you want to generate..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <AIGenerateButton
            type="button"
            onClick={generateQuestionsWithAI}
            disabled={isGenerating}
            whileHover={!isGenerating ? { scale: 1.03 } : {}}
            whileTap={!isGenerating ? { scale: 0.98 } : {}}
          >
            {isGenerating ? (
              <LoadingDots>
                <span></span>
                <span></span>
                <span></span>
              </LoadingDots>
            ) : (
              'Generate'
            )}
          </AIGenerateButton>
        </AIInputContainer>
      </AISection>

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Assignment Title"
          value={assignment.title}
          onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
          required
        />

        <AnimatePresence>
          {assignment.questions.map((q, idx) => (
            <QuestionContainer
              key={idx}
              variants={questionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <QuestionHeader>
                <QuestionNumber>Question {idx + 1}</QuestionNumber>
                <Button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Remove
                </Button>
              </QuestionHeader>

              <Select
                value={q.type}
                onChange={(e) => changeQuestionType(idx, e.target.value)}
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="descriptive">Descriptive</option>
              </Select>

              <Input
                type="text"
                placeholder="Enter your question"
                value={q.question}
                onChange={(e) => {
                  const updated = [...assignment.questions];
                  updated[idx].question = e.target.value;
                  setAssignment({ ...assignment, questions: updated });
                }}
                required
              />

              {q.type === "mcq" && (
                <>
                  <OptionsContainer>
                    {q.options.map((opt, i) => (
                      <OptionInput
                        key={i}
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...assignment.questions];
                          updated[idx].options[i] = e.target.value;
                          setAssignment({ ...assignment, questions: updated });
                        }}
                        required
                      />
                    ))}
                  </OptionsContainer>
                </>
              )}

              <AnswerLabel>Correct Answer:</AnswerLabel>
              <AnswerInput
                type="text"
                placeholder={q.type === "mcq" ? "Enter correct option letter/number" : "Enter expected answer"}
                value={q.answer}
                onChange={(e) => {
                  const updated = [...assignment.questions];
                  updated[idx].answer = e.target.value;
                  setAssignment({ ...assignment, questions: updated });
                }}
                required
              />
            </QuestionContainer>
          ))}
        </AnimatePresence>

        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            type="button"
            onClick={addQuestion}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add Question
          </Button>
          <Button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || assignment.questions.length === 0}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Assignment'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default ScheduleAssignment;