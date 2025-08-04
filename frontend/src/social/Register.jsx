import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });
  const navigate = useNavigate();

  const showAlert = (message, type = "info") => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      showAlert("All fields are required", "warning");
      return;
    }

    if (name.length < 3) {
      showAlert("Name too short\nEnter full name", "warning");
      return;
    }

    if (!validateEmail(email)) {
      showAlert("Invalid email format", "error");
      return;
    }

    if (password.length < 6) {
      showAlert("Password too short\nPassword must be at least 6 characters", "warning");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      showAlert("Registration successful", "success");
      navigate("/auth/login");
    } catch (err) {
      showAlert(`Registration failed: ${err.message || "Try another email"}`, "error");
    }
  };

  return (
    <div style={{
      background: "linear-gradient(to bottom right, #FFF7ED, #FED7AA)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        padding: "80px 0",
        width: "100%",
        maxWidth: "448px"
      }}>
        <div style={{
          padding: "32px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          width: "100%"
        }}>
          <h1 style={{
            marginBottom: "24px",
            color: "#9C4221",
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold"
          }}>REGISTER</h1>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                background: "#FFF7ED",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                outline: "none",
                fontSize: "16px"
              }}
            />
            
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                background: "#FFF7ED",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                outline: "none",
                fontSize: "16px"
              }}
            />
            
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                background: "#FFF7ED",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                outline: "none",
                fontSize: "16px"
              }}
            />
            
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={{
                background: "#FFF7ED",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                outline: "none",
                fontSize: "16px"
              }}
            >
              <option value="Student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
            
            <button
              onClick={handleRegister}
              style={{
                background: "#9C4221",
                color: "white",
                padding: "10px",
                borderRadius: "6px",
                border: "none",
                fontSize: "16px",
                fontWeight: "medium",
                cursor: "pointer"
              }}
            >
              Register
            </button>
            
            <p style={{ textAlign: "center", fontSize: "14px" }}>
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9C4221",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "14px"
                }}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}