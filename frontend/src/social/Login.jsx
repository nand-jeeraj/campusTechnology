import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const showAlert = (message, type) => {
    alert(`${type}: ${message}`);
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      showAlert("Enter all fields", "warning");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);
      showAlert("Login successful", "success");
      navigate("/discussions");

    } catch (err) {
      showAlert(
        "Login failed: " + (err?.response?.data?.msg || "Invalid credentials"),
        "error"
      );
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
          }}>LOGIN</h1>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                background: "#FFF7ED",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB"
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                background: "#FFF7ED",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB"
              }}
            />
            <button
              onClick={handleLogin}
              style={{
                background: "#9C4221",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer"
              }}
            >
              Login
            </button>
            <p style={{ textAlign: "center" }}>
              Don't have an account?{" "}
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#9C4221",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0
                }}
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}