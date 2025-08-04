// Sample quiz and assignment data (can be replaced with API later)

export const quizData = [
  {
    id: "quiz1",
    title: "JavaScript Basics",
    questions: [
      {
        id: "q1",
        question: "What is closure in JavaScript?",
        options: ["Scope chain", "Loop", "Object", "Array"],
        answer: "Scope chain", // for analysis later
      },
      {
        id: "q2",
        question: "Which keyword is used to declare a variable?",
        options: ["var", "let", "const", "All of the above"],
        answer: "All of the above",
      },
    ],
  },
];

export const assignmentData = [
  {
    id: "assign1",
    title: "React Component Assignment",
    questions: [
      {
        id: "a1",
        type: "mcq",
        question: "React is developed by?",
        options: ["Google", "Facebook", "Microsoft", "Amazon"],
        answer: "Facebook",
      },
      {
        id: "a2",
        type: "descriptive",
        question: "Explain the concept of state and props in React.",
        answer: "State is..." // For Python analysis
      },
    ],
  },
];
