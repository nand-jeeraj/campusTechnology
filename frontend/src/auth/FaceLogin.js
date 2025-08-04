import React, { useRef, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authcontext";
import api from "../services/api";
import styled from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../services/api';
import axios from "axios";

// Styled Components
const LoginContainer = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const LoginTitle = styled.h2`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const VideoBox = styled.div`
  width: 100%;
  height: 300px;
  background: #f7fafc;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
  position: relative;
  border: 2px dashed #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror */
`;

const CameraPlaceholder = styled.div`
  position: absolute;
  z-index: 2;
  color: #718096;
  font-size: 1rem;
  background: rgba(255,255,255,0.8);
  width: 100%;
  height: 100%;
  display: ${props => (props.show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${props =>
    props.primary ? '#4299e1' :
    props.secondary ? '#e2e8f0' : '#48bb78'};
  color: ${props =>
    props.primary ? 'white' :
    props.secondary ? '#4a5568' : 'white'};
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background-color: ${props =>
      props.primary ? '#3182ce' :
      props.secondary ? '#cbd5e0' : '#38a169'};
  }
`;

const StatusMessage = styled.p`
  padding: 0.75rem;
  border-radius: 0.375rem;
  background: ${props =>
    props.error ? '#fff5f5' :
    props.success ? '#f0fff4' : '#ebf8ff'};
  color: ${props =>
    props.error ? '#e53e3e' :
    props.success ? '#38a169' : '#2b6cb0'};
  font-size: 0.95rem;
  margin-top: 1rem;
  border: 1px solid ${props =>
    props.error ? '#fed7d7' :
    props.success ? '#c6f6d5' : '#bee3f8'};
`;

const FaceLogin = () => {
  const videoRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const navigate = useNavigate();
  const { setAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setMessage("Starting camera...");
      setMessageType("");

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setMessage("Camera started successfully");
        setMessageType("success");
      }
    } catch (err) {
      console.error("Camera error:", err);
      setMessage("Camera error: " + err.message);
      setMessageType("error");
    }
  };

  const captureImage = () => {
    if (!cameraActive || !videoRef.current) {
      setMessage("Please start the camera first");
      setMessageType("error");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) {
        setMessage("Failed to create image blob");
        setMessageType("error");
        return;
      }

      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setCapturedImage(file);
      setMessage("Face captured successfully!");
      setMessageType("success");

      // Stop camera
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setCameraActive(false);
      }
    }, "image/jpeg", 0.95);
  };

  const handleLogin = async () => {
    if (!capturedImage) {
      setMessage("Please capture your face to continue");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("image", capturedImage);

    try {
      setMessage("Authenticating...");
      const res = await axios.post(`${BASE_URL}api/face-login`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "Login successful");
      setMessageType("success");

      if (res.data.token) {
        const role = res.data.role === "faculty" ? "Faculty" : "Student";

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("authenticated", "true");
        localStorage.setItem("user_id", res.data.id);
        localStorage.setItem("user_name", res.data.name);
        localStorage.setItem("user_role", role);
        setAuthenticated(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      } else {
        setMessage("No token received from server");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.response?.data?.error || "Face login failed");
      setMessageType("error");
    }
  };

  return (
    <LoginContainer>
      <LoginTitle>Face Authentication</LoginTitle>

      <VideoBox>
        <VideoElement ref={videoRef} autoPlay playsInline muted />
        <CameraPlaceholder show={!cameraActive && !capturedImage}>
          {capturedImage
            ? "Face captured - ready for login"
            : "Camera is off - click 'Start Camera'"}
        </CameraPlaceholder>
      </VideoBox>

      <ButtonGroup>
        <ActionButton onClick={startCamera} secondary whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          Start Camera
        </ActionButton>
        <ActionButton onClick={captureImage} disabled={!cameraActive} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          Capture Face
        </ActionButton>
        <ActionButton onClick={handleLogin} primary disabled={!capturedImage} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          Login with Face
        </ActionButton>
        <ActionButton 
          onClick={() => navigate("/auth/login-options")} 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          secondary
        >
          Back to Options
        </ActionButton>

      </ButtonGroup>

      {message && (
        <StatusMessage error={messageType === "error"} success={messageType === "success"}>
          {message}
        </StatusMessage>
      )}
    </LoginContainer>
  );
};

export default FaceLogin;
