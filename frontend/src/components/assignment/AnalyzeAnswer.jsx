// src/components/assignment/AnalyzeAnswer.jsx

function simpleTextAnalysis(userAnswer, correctAnswer) {
  // Very basic keyword match simulation
  if (!userAnswer || !correctAnswer) return false;

  const userWords = userAnswer.toLowerCase().split(/\W+/);
  const correctWords = correctAnswer.toLowerCase().split(/\W+/);

  const matched = correctWords.filter(word => userWords.includes(word));
  const matchPercent = (matched.length / correctWords.length) * 100;

  return matchPercent >= 50; // return true if 50% or more keywords match
}

export default simpleTextAnalysis;
