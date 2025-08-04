// src/DebugView.jsx
function DebugView() {
  const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
  const assignments = JSON.parse(localStorage.getItem("assignments") || "[]");

  return (
    <div>
      <h2>Saved Quizzes:</h2>
      <pre>{JSON.stringify(quizzes, null, 2)}</pre>

      <h2>Saved Assignments:</h2>
      <pre>{JSON.stringify(assignments, null, 2)}</pre>
    </div>
  );
}

export default DebugView;
