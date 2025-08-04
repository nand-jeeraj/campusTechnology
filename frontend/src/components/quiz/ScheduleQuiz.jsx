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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled(motion.h2)`
  color: #2b6cb0;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #4a5568;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const QuestionCard = styled(motion.div)`
  background: #f7fafc;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #4299e1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const PrimaryButton = styled(Button)`
  background: #4299e1;
  color: white;

  &:hover {
    background: #3182ce;
  }
`;

const SecondaryButton = styled(Button)`
  background: #e2e8f0;
  color: #4a5568;

  &:hover {
    background: #cbd5e0;
  }
`;

const UploadButton = styled(Button)`
  background: #9f7aea;
  color: white;

  &:hover {
    background: #805ad5;
  }
`;

const DoneButton = styled(Button)`
  background: #38a169;
  color: white;

  &:hover {
    background: #2f855a;
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

const SuccessMessage = styled(motion.div)`
  background: #48bb78;
  color: white;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FileInput = styled.input`
  display: none;
`;

const AIPromptInput = styled(Input)`
  margin-top: 1rem;
`;

const AIPromptContainer = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
`;
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
  width: 60%;
  border: 1px solid #cbd5e1;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
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

// Animation variants
const cardVariants = {
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

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

function ScheduleQuiz() {
  const [quiz, setQuiz] = useState({
    title: "",
    questions: [],
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [showDone, setShowDone] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = React.createRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quiz.title.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    if (quiz.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    // Prepare the data in the correct format
    const payload = {
      title: quiz.title,
      questions: quiz.questions.map(q => ({
        type: "mcq",  // Explicitly set the type
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        answer: q.answer.trim()
      }))
    };

    try {
      const response = await axios.post(`${BASE_URL}quizzes`, payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.status >= 400) {
        throw new Error(response.data?.detail || "Failed to submit");
      }

      setShowSuccess(true);
      setTimeout(() => {
        setQuiz({ title: "", questions: [] });
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error:", err);
      alert("Submission failed: " + (err.response?.data?.detail || err.message));
    }
  };

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions, 
        { 
          question: "", 
          options: ["", "", "", ""], 
          answer: "" 
        }
      ],
    }));
  };

  const removeQuestion = (index) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
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

        const parsedQuestions = jsonData.map((row) => {
          // Handle various column name formats
          const question = row.question || row.Question || row.QUESTION || '';
          const option1 = row.option1 || row['Option 1'] || row['OPTION 1'] || row['Option1'] || row['Option 1'] || '';
          const option2 = row.option2 || row['Option 2'] || row['OPTION 2'] || row['Option2'] || row['Option 2'] || '';
          const option3 = row.option3 || row['Option 3'] || row['OPTION 3'] || row['Option3'] || row['Option 3'] || '';
          const option4 = row.option4 || row['Option 4'] || row['OPTION 4'] || row['Option4'] || row['Option 4'] || '';
          const answer = row.answer || row['Correct Answer'] || row['CORRECT ANSWER'] || row.Answer || row.ANSWER || '';

          if (!question || !option1 || !option2 || !option3 || !option4 || !answer) {
            console.warn('Skipping invalid row:', row);
            return null;
          }

          return {
            question: question.toString().trim(),
            options: [
              option1.toString().trim(),
              option2.toString().trim(),
              option3.toString().trim(),
              option4.toString().trim()
            ],
            answer: answer.toString().trim()
          };
        }).filter(Boolean);

        if (parsedQuestions.length === 0) {
          alert("No valid questions found in the uploaded file. Please check the format.");
          return;
        }

        setQuiz(prev => ({
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

  const handleDoneClick = () => {
    // This would be where you process the uploaded data
    // For now, we'll just simulate adding some questions
    const sampleQuestions = [
      {
        question: "Sample question from Excel",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Option 2"
      },
      {
        question: "Another sample question",
        options: ["Choice A", "Choice B", "Choice C", "Choice D"],
        answer: "Choice C"
      }
    ];

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, ...sampleQuestions]
    }));

    setShowDone(false);
    setShowUpload(true);
  };

  const generateQuestionsWithAI = async () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a prompt (e.g., '5 questions for 10th grade biology about photosynthesis')");
      return;
    }

    setIsGenerating(true);
    try {
      // Call your backend API which will connect to OpenAI
      const response = await axios.post(`${BASE_URL}generate-questions-quiz`, {
        prompt: aiPrompt
      });

      if (response.data && response.data.questions) {
        setQuiz(prev => ({
          ...prev,
          questions: [...prev.questions, ...response.data.questions]
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

  return (
    <Container>
      <TitleContainer>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Schedule a Quiz
        </Title>
        {showUpload && (
          <UploadButton
            onClick={handleUploadClick}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload
          </UploadButton>
        )}
        {showDone && (
          <DoneButton
            onClick={handleDoneClick}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Done
          </DoneButton>
        )}
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload}
          accept=".xlsx,.xls,.csv"
        />
      </TitleContainer>

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
    Enter a topic or concept and let our AI generate quiz questions automatically.
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
        <InputGroup>
          <Label>Quiz Title</Label>
          <Input
            type="text"
            placeholder="Enter quiz title"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            required
          />
        </InputGroup>

        <AnimatePresence>
          {quiz.questions.map((q, idx) => (
            <QuestionCard
              key={idx}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <InputGroup>
                <Label>Question {idx + 1}</Label>
                <Input
                  type="text"
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) => {
                    const updated = [...quiz.questions];
                    updated[idx].question = e.target.value;
                    setQuiz({ ...quiz, questions: updated });
                  }}
                  required
                />
              </InputGroup>

              <OptionsGrid>
                {q.options.map((opt, optIdx) => (
                  <InputGroup key={optIdx}>
                    <Label>Option {optIdx + 1}</Label>
                    <Input
                      type="text"
                      placeholder={`Option ${optIdx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...quiz.questions];
                        updated[idx].options[optIdx] = e.target.value;
                        setQuiz({ ...quiz, questions: updated });
                      }}
                      required
                    />
                  </InputGroup>
                ))}
              </OptionsGrid>

              <InputGroup>
                <Label>Correct Answer</Label>
                <Input
                  type="text"
                  placeholder="Enter correct answer (must match one option exactly)"
                  value={q.answer}
                  onChange={(e) => {
                    const updated = [...quiz.questions];
                    updated[idx].answer = e.target.value;
                    setQuiz({ ...quiz, questions: updated });
                  }}
                  required
                />
              </InputGroup>

              <Button
                type="button"
                onClick={() => removeQuestion(idx)}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                style={{ alignSelf: 'flex-end', background: '#f56565', color: 'white' }}
              >
                Remove Question
              </Button>
            </QuestionCard>
          ))}
        </AnimatePresence>

        <SecondaryButton
          type="button"
          onClick={addQuestion}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Question
        </SecondaryButton>

        {quiz.questions.length > 0 && (
          <PrimaryButton
            type="submit"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Schedule Quiz
          </PrimaryButton>
        )}

        <AnimatePresence>
          {showSuccess && (
            <SuccessMessage
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Quiz Scheduled Successfully!
            </SuccessMessage>
          )}
        </AnimatePresence>
      </Form>
    </Container>
  );
}

export default ScheduleQuiz;