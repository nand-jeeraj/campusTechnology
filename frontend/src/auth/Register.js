import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
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
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f7fafc, #ebf8ff);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const FormContainer = styled(motion.form)`
  background: white;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 450px;
  margin: 0 1rem;
`;

const FormTitle = styled.h2`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
`;

const FormInput = styled.input`
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

  &:disabled {
    background-color: #edf2f7;
    cursor: not-allowed;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;

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

const FormButton = styled(motion.button)`
  width: 100%;
  padding: 0.75rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${props => props.disabled ? '#4299e1' : '#3182ce'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s ease-in-out infinite;
  margin-right: 8px;
`;

const FormFooter = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #4a5568;
`;

const FormLink = styled(Link)`
  color: #4299e1;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const FormHint = styled.small`
  display: block;
  color: #718096;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const FileInputWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const FileInputLabel = styled.label`
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: 1px dashed #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #4a5568;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.disabled ? '#e2e8f0' : '#4299e1'};
    color: ${props => props.disabled ? '#4a5568' : '#4299e1'};
  }

  ${props => props.disabled && `
    cursor: not-allowed;
    background-color: #edf2f7;
  `}
`;

const FileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
`;

const FileName = styled.div`
  font-size: 0.875rem;
  color: #4a5568;
  margin-top: 0.5rem;
  text-align: center;
  word-break: break-all;
`;

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.role || !image) {
      alert("All fields are required including image and role.");
      return;
    }
    if (!validateEmail(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(form.password)) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append("name", form.name);
    data.append("email", form.email);
    data.append("password", form.password);
    data.append("role", form.role);
    data.append("image", image);

    try {
      await axios.post(`${BASE_URL}api/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Registration successful!");
      navigate("/auth/login-options");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormContainer
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FormTitle>Create Account</FormTitle>

        <FormInput
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          disabled={isLoading}
        />

        <FormInput
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          disabled={isLoading}
        />

        <FormInput
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          disabled={isLoading}
        />

        <FormSelect
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
          disabled={isLoading}
        >
          <option value="Student">Student</option>
          <option value="faculty">Faculty</option>
        </FormSelect>

        <FileInputWrapper>
          <FileInputLabel disabled={isLoading}>
            {image ? "Change Profile Picture" : "Upload Profile Picture"}
            <FileInput
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
              disabled={isLoading}
            />
          </FileInputLabel>
          {image && <FileName>{image.name}</FileName>}
        </FileInputWrapper>

        <FormHint>Password must be at least 6 characters</FormHint>

        <FormButton
          type="submit"
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </FormButton>

        <FormFooter>
          Already have an account?{" "}
          <FormLink to="/auth/login-options">Login here</FormLink>
        </FormFooter>
      </FormContainer>
    </PageContainer>
  );
}