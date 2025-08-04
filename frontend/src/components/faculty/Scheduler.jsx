import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import * as XLSX from 'xlsx';
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

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
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

const Select = styled.select`
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

const UploadButton = styled(Button)`
  background: #9f7aea;
  color: white;

  &:hover {
    background: #805ad5;
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

const FileInput = styled.input`
  display: none;
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

function Scheduler() {
  const [form, setForm] = useState({
    title: "",
    type: "quiz",
    start_time: "",
    end_time: "",
    duration_minutes: 10,
    questions: [
      { id: "q1", question: "", type: "mcq", options: ["", "", "", ""], answer: "" },
    ]
  });
const [aiPrompt, setAiPrompt] = useState("");
const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = React.createRef();

const generateQuestionsWithAI = async () => {
  if (!aiPrompt.trim()) {
    alert("Please enter a prompt (e.g., '5 questions for 10th grade biology about photosynthesis')");
    return;
  }

  setIsGenerating(true);
  try {
    const response = await axios.post(`${BASE_URL}generate-questions-timer-quiz-assignment`, {
      prompt: aiPrompt
    });

    if (response.data && response.data.questions) {
      const newQuestions = response.data.questions.map((q, index) => ({
        id: `ai-q${form.questions.length + index + 1}`,
        question: q.question,
        type: q.type || "mcq",
        options: q.options || ["", "", "", ""],
        answer: q.answer
      }));

      setForm(prev => ({
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

const handleAIFileUpload = async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  setIsGenerating(true);
  
  try {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    if (aiPrompt) {
      formData.append('prompt', aiPrompt);
    }

    const response = await axios.post(
      `${BASE_URL}generate-questions-timer-quiz-assignment`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data && response.data.questions) {
      const newQuestions = response.data.questions.map((q, index) => ({
        id: `ai-q${form.questions.length + index + 1}`,
        question: q.question,
        type: q.type || "mcq",
        options: q.options || ["", "", "", ""],
        answer: q.answer
      }));

      setForm(prev => ({
        ...prev,
        questions: [...prev.questions, ...newQuestions]
      }));
    }
  } catch (error) {
    console.error("Error processing files:", error);
    alert("Failed to process files: " + error.message);
  } finally {
    setIsGenerating(false);
    e.target.value = ''; // Reset file input
  }
};

  const handleQuestionChange = (idx, field, value) => {
    const questions = [...form.questions];
    if (field === "options") {
      questions[idx].options = value;
    } else {
      questions[idx][field] = value;
    }
    setForm({ ...form, questions });
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, { id: `q${form.questions.length + 1}`, question: "", type: "mcq", options: ["", "", "", ""], answer: "" }]
    });
  };

  const removeQuestion = (index) => {
    if (form.questions.length <= 1) return;
    const newQuestions = [...form.questions];
    newQuestions.splice(index, 1);
    setForm({ ...form, questions: newQuestions });
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
            id: `uploaded-q${index + 1}`,
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

        setForm(prev => ({
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

  const submitQuizOrAssignment = () => {
    // Prepare questions payload
    const questions = form.questions.map(q => {
      const questionObj = {
        id: q.id || undefined, // Only include if it exists
        type: q.type,
        question: q.question,
        answer: q.answer
      };
      
      // Only include options if it's MCQ
      if (q.type === "mcq") {
        questionObj.options = q.options;
      }
      
      return questionObj;
    });

    const payload = {
      title: form.title,
      questions: questions,
      ...(form.start_time && form.end_time && {
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        duration_minutes: form.duration_minutes
      })
    };
    
    let url;
    if (form.type === "quiz") {
      url = form.start_time 
        ? `${BASE_URL}scheduled-quizzes`
        : `${BASE_URL}quizzes`;
    } else {
      url = form.start_time
        ? `${BASE_URL}create-scheduled-assignment`
        : `${BASE_URL}create-assignment`;
    }

    axios.post(url, payload)
      .then(() => alert("Created successfully"))
      .catch(err => {
        console.error("Error details:", err.response?.data || err.message);
        alert(`Creation failed: ${err.response?.data?.detail || err.message}`);
      });
  };
  
// Add this utility function at the top of your file
const getISTDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  // IST is UTC+5:30
  const offset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(d.getTime() + offset);
  
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  return istDate.toISOString().slice(0, 16);
};

const getLocalDateTimeFromIST = (istString) => {
  if (!istString) return '';
  
  // Parse the IST datetime string (assuming it's in local time)
  const d = new Date(istString);
  // Adjust back to UTC by subtracting the offset
  const offset = 5.5 * 60 * 60 * 1000;
  const localDate = new Date(d.getTime() - offset);
  
  return localDate.toISOString().slice(0, 16);
};

  return (
    <Container>
      <TitleContainer>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {form.type === "quiz" ? "📝 Schedule Quiz" : "📚 Schedule Assignment"}
        </Title>
        
        <UploadButton
          onClick={handleUploadClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
           Upload Questions
        </UploadButton>
        
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

    <Button 
      type="button"
      onClick={() => fileInputRef.current.click()}
      style={{ 
        background: '#6b46c1',
        marginBottom: '1rem'
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      Upload Files (PDF/Images)
    </Button>

    <FileInput 
      type="file" 
      ref={fileInputRef} 
      onChange={handleAIFileUpload}
      accept=".pdf,.jpg,.jpeg,.png,.txt"
      multiple
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

      <FormGroup>
        <Label>Title</Label>
        <Input 
          placeholder="Enter title" 
          value={form.title} 
          onChange={e => setForm({ ...form, title: e.target.value })} 
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>Type</Label>
        <Select 
          value={form.type} 
          onChange={e => setForm({ ...form, type: e.target.value })}
        >
          <option value="quiz">Quiz</option>
          <option value="assignment">Assignment</option>
        </Select>
      </FormGroup>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormGroup>
          <Label>Start Time</Label>
          <Input 
            type="datetime-local" 
            onChange={(e) => setForm({ ...form, start_time: e.target.value })} 
          required
          />
        </FormGroup>

        <FormGroup>
          <Label>End Time</Label>
          <Input 
            type="datetime-local" 
            onChange={(e) => setForm({ ...form, end_time: e.target.value })} 
          required
          />
        </FormGroup>
      </div>

      <FormGroup>
        <Label>Duration (minutes)</Label>
        <Input 
          type="number" 
          value={form.duration_minutes} 
          onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })} 
        required
        min="1"
        />
      </FormGroup>

      <Divider />

      <h3 style={{ color: '#4a5568', marginBottom: '1.5rem' }}>Questions</h3>

      <AnimatePresence>
        {form.questions.map((q, idx) => (
          <QuestionContainer
            key={q.id}
            variants={questionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <QuestionTitle>
              <span>Question {idx + 1}</span>
              {form.questions.length > 1 && (
                <Button 
                  onClick={() => removeQuestion(idx)}
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
              <TextArea 
                value={q.question} 
                onChange={e => handleQuestionChange(idx, "question", e.target.value)} 
                placeholder="Enter your question here..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Question Type</Label>
              <Select 
                value={q.type} 
                onChange={e => handleQuestionChange(idx, "type", e.target.value)}
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="descriptive">Descriptive</option>
              </Select>
            </FormGroup>

            {q.type === "mcq" && (
              <>
                <Label>Options</Label>
                {q.options.map((opt, i) => (
                  <OptionInput
                    key={i}
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => {
                      const newOptions = [...q.options];
                      newOptions[i] = e.target.value;
                      handleQuestionChange(idx, "options", newOptions);
                    }}
                  />
                ))}
              </>
            )}

            <FormGroup>
              <Label>Correct Answer</Label>
              <Input 
                placeholder="Enter correct answer" 
                value={q.answer} 
                onChange={e => handleQuestionChange(idx, "answer", e.target.value)} 
              />
            </FormGroup>
          </QuestionContainer>
        ))}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <SecondaryButton 
          onClick={addQuestion}
          whileHover={{ scale: 1.05 }}
        >
          + Add Question
        </SecondaryButton>

        <Button 
          onClick={submitQuizOrAssignment}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Submit {form.type === "quiz" ? "Quiz" : "Assignment"}
        </Button>
      </div>
    </Container>
  );
}

export default Scheduler;