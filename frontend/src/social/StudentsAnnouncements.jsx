import { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { BASE_URL } from '../services/api';

// Styled Components
const PageContainer = styled.div`
  background: linear-gradient(to bottom right, #f7fafc, #ebf8ff);
  min-height: 100vh;
  padding: 2rem 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const ContentContainer = styled.div`
  max-width: 56rem;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Title = styled(motion.h1)`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.5rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #4299e1, #48bb78);
    border-radius: 2px;
  }
`;

const AnnouncementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const AnnouncementCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #4299e1;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const AnnouncementTitle = styled.h2`
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const AnnouncementMessage = styled.p`
  color: #4a5568;
  margin-bottom: 0.75rem;
  line-height: 1.5;
`;

const AnnouncementMeta = styled.p`
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}announcements`)
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PageContainer>
      <ContentContainer>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Important Announcements
        </Title>
        
        {loading ? (
          <EmptyState>Loading announcements...</EmptyState>
        ) : announcements.length === 0 ? (
          <EmptyState>No announcements available.</EmptyState>
        ) : (
          <AnnouncementsList>
            {announcements.map(a => (
              <AnnouncementCard
                key={a._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnnouncementTitle>{a.title}</AnnouncementTitle>
                <AnnouncementMessage>{a.message}</AnnouncementMessage>
                <AnnouncementMeta>Posted by {a.created_by}</AnnouncementMeta>
              </AnnouncementCard>
            ))}
          </AnnouncementsList>
        )}
      </ContentContainer>
    </PageContainer>
  );
}