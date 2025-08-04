import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authcontext";
import api from "../services/api";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../services/api';
import axios from "axios";

// Loading animation keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f7fafc, #ebf8ff);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const LoginForm = styled(motion.form)`
  background: white;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoginTitle = styled.h2`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 600;
`;

const InputField = styled.input`
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

  &:disabled {
    background-color: #edf2f7;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 0.75rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;

  &:hover {
    background-color: #3182ce;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s ease-in-out infinite;
`;

const RegisterText = styled.p`
  color: #4a5568;
  text-align: center;
  font-size: 0.95rem;
  margin-top: 1rem;
`;

const RegisterLink = styled.a`
  color: #4299e1;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}api/login`, form);
        if (res.data?.success && res.data?.token) {
          const role = res.data.role === "faculty" ? "Faculty" : "Student";
          
          localStorage.setItem("authenticated", "true");
          localStorage.setItem("token", res.data.token || "session");
          localStorage.setItem("authenticated", "true");
          localStorage.setItem("user_role", role);
          localStorage.setItem("user_id", res.data.user_id);
          localStorage.setItem("user_name", res.data.name);
          
          setAuthenticated(true);
          window.location.href = "/";
        } else {
        alert(res.data?.message || "Invalid credentials");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LoginTitle>Welcome Back</LoginTitle>

        <InputField
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          disabled={isLoading}
        />

        <InputField
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          disabled={isLoading}
        />

        <SubmitButton
          type="submit"
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </SubmitButton>

        <RegisterText>
          Don't have an account?{" "}
          <RegisterLink href="/auth/register">Register here</RegisterLink>
        </RegisterText>
      </LoginForm>
    </LoginContainer>
  );
}