import React, { useState } from "react";
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
const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Card = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
`;

const InputField = styled.input`
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
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

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
  margin-right: 8px;
`;

const FileInputWrapper = styled.div`
  margin-bottom: 1rem;
`;

const FileInputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
`;

const PreviewContainer = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
`;

export default function AddFace() {
  const [name, setName] = useState("");
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = async () => {
    if (!name || !img) {
      alert("Please provide both a name and an image.");
      return;
    }

    setIsLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("image", img);

    try {
      await axios.post(`${BASE_URL}api/attendance_known-face`, fd, {
        headers: { "Content-Type": "multipart/form-data" }, 
      });
      alert("Face added successfully!");
      setName("");
      setImg(null);
      setPreview(null);
    } catch (err) {
      console.error("Error adding face:", err);
      alert("Failed to add face.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Title>Add Known Face</Title>

        <InputField
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />

        <FileInputWrapper>
          <FileInputLabel>Upload Face Image</FileInputLabel>
          <InputField
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
          />
        </FileInputWrapper>

        {preview && (
          <PreviewContainer>
            <ImagePreview src={preview} alt="Preview" />
          </PreviewContainer>
        )}

        <SubmitButton
          onClick={submit}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Processing...
            </>
          ) : (
            "Submit"
          )}
        </SubmitButton>
      </Card>
    </Container>
  );
}