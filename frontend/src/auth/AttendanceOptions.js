import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../services/api';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f7fafc 0%, #ebf8ff 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 1rem;
`;

const OptionsBox = styled(motion.div)`
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h2`
  color: #2b6cb0;
  font-size: 1.8rem;
  margin-bottom: 2.5rem;
  font-weight: 700;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -0.75rem;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #4299e1, #48bb78);
    border-radius: 2px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: ${props => props.face ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)'};
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    animation: ${pulse} 1.5s infinite;
  }

  &:active {
    transform: translateY(0);
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RegisterText = styled.p`
  color: #4a5568;
  margin-top: 2rem;
  font-size: 0.95rem;
`;

const RegisterLink = styled(motion.a)`
  color: #4299e1;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #4299e1;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const LoadingDot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  margin: 0 2px;
`;

export default function AttendanceOptions() {
  const navigate = useNavigate();
  const [loadingButton, setLoadingButton] = useState(null);

  const handleNavigation = (path) => {
    setLoadingButton(path);
    setTimeout(() => {
      navigate(path);
      setLoadingButton(null);
    }, 800);
  };

  return (
    <Container>
      <OptionsBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Title>Choose Login Method</Title>

        <ButtonGroup>
          <LoginButton
            onClick={() => handleNavigation("/auth/login")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loadingButton === "/auth/login"}
          >
            <IconWrapper>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </IconWrapper>
            {loadingButton === "/auth/login" ? (
              <>
                <LoadingDot 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
                <LoadingDot 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                />
                <LoadingDot 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                />
              </>
            ) : (
              "Login with Credentials"
            )}
          </LoginButton>

          <LoginButton
            face
            onClick={() => handleNavigation("/auth/face-login")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loadingButton === "/auth/face-login"}
          >
            <IconWrapper>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M17 8h.01" />
                <path d="M21 12h.01" />
                <path d="M16 16h.01" />
              </svg>
            </IconWrapper>
            {loadingButton === "/auth/face-login" ? (
              <>
                <LoadingDot 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
                <LoadingDot 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                />
                <LoadingDot 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                />
              </>
            ) : (
              "Login with Face"
            )}
          </LoginButton>
        </ButtonGroup>

        <RegisterText>
          Don't have an account?{' '}
          <RegisterLink 
            href="/auth/register"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Register here
          </RegisterLink>
        </RegisterText>
      </OptionsBox>
    </Container>
  );
}