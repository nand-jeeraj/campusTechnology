import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from "../services/api";
import axios from "axios";

// Loading animation keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const UploadPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  background: linear-gradient(to bottom right, #f7fafc, #ebf8ff);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const UploadCard = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const UploadTitle = styled.h2`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const UploadInputContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const UploadInputLabel = styled.label`
  display: block;
  padding: 1rem;
  border: 2px dashed #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4299e1;
    background-color: #f7fafc;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const UploadInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const UploadButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #3182ce;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: #4a5568;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const ResultContainer = styled(motion.div)`
  margin-top: 2rem;
  text-align: left;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
`;

const ResultTitle = styled.h3`
  color: #2d3748;
  font-size: 1.25rem;
  margin: 1rem 0 0.5rem;
`;

const ResultText = styled.p`
  color: #4a5568;
  margin: 0.5rem 0;
  line-height: 1.5;
`;

const StrongText = styled.span`
  font-weight: 600;
  color: #2d3748;
`;

const PresentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
`;

const PresentItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const NoKnownText = styled.p`
  color: #718096;
  font-style: italic;
  margin: 1rem 0;
`;

export default function UploadPage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    const fd = new FormData();
    fd.append("image", image);

    setLoading(true);
    setResult(null); 

    try {
      const res = await axios.post(`${BASE_URL}api/attendance_upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UploadPageContainer>
      <UploadCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <UploadTitle>Upload Group Photo</UploadTitle>

        <UploadInputContainer>
          <UploadInputLabel disabled={loading}>
            {image ? image.name : "Choose an image"}
            <UploadInput
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              disabled={loading}
            />
          </UploadInputLabel>
        </UploadInputContainer>

        <UploadButton
          onClick={submit}
          disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          {loading && <LoadingSpinner />}
          {loading ? "Processing..." : "Upload"}
        </UploadButton>

        {loading && (
          <LoadingText>Detecting faces, please wait...</LoadingText>
        )}

        {result && !loading && (
          <ResultContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ResultText>
              <StrongText>Total Faces Detected:</StrongText> {result.total}
            </ResultText>
            <ResultText>
              <StrongText>Unknown Faces:</StrongText> {result.unknown}
            </ResultText>

            <ResultTitle>Present Students</ResultTitle>
            {result.present.length === 0 ? (
              <NoKnownText>No known faces found</NoKnownText>
            ) : (
              <PresentList>
                {result.present.map((name, idx) => (
                  <PresentItem key={idx}>{name}</PresentItem>
                ))}
              </PresentList>
            )}
          </ResultContainer>
        )}
      </UploadCard>
    </UploadPageContainer>
  );
}