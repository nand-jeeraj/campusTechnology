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
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const AnnouncementForm = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border-left: 4px solid #4299e1;
`;

const FormTitle = styled.h1`
  color: #2b6cb0;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
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
`;

const FormTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3182ce;
  }
`;

const AnnouncementsTitle = styled.h2`
  color: #2b6cb0;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const AnnouncementCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  border-left: 4px solid #48bb78;
`;

const AnnouncementTitle = styled.h3`
  color: #2d3748;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const AnnouncementMessage = styled.p`
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const AnnouncementMeta = styled.p`
  color: #718096;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-size: 1rem;
`;

export default function FacultyAnnouncements() {
  const [form, setForm] = useState({ title: "", message: "" });
  const [announcements, setAnnouncements] = useState([]);

  const showAlert = (message, type) => {
    alert(`${type}: ${message}`);
  };

  const load = async () => {
    try {
      const response = await fetch(`${BASE_URL}announcements`);
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      console.error("Error loading announcements:", err);
    }
  };

  const submit = async () => {
    if (!form.title || !form.message) {
      showAlert("Fill all fields", "Warning");
      return;
    }
    try {
      const name = localStorage.getItem("user_name") || "Anonymous User";
      const role = localStorage.getItem("user_role") || "Faculty";
      await fetch(`${BASE_URL}announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": name,
          "x-user-role": role
        },
        body: JSON.stringify(form)
      });
      showAlert("Announcement posted", "Success");
      setForm({ title: "", message: "" });
      load();
    } catch (err) {
      showAlert("Error posting announcement", "Error");
      console.error("Error posting announcement:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageContainer>
      <ContentContainer>
        <AnnouncementForm
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FormTitle>Create Announcement</FormTitle>
          <FormInput
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <FormTextArea
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <SubmitButton
            onClick={submit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Post Announcement
          </SubmitButton>
        </AnnouncementForm>

        <AnnouncementsTitle>All Announcements</AnnouncementsTitle>

        {announcements.length === 0 ? (
          <EmptyState>No announcements yet</EmptyState>
        ) : (
          <div>
            {announcements.map(a => (
              <AnnouncementCard
                key={a._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnnouncementTitle>{a.title}</AnnouncementTitle>
                <AnnouncementMessage>{a.message}</AnnouncementMessage>
                <AnnouncementMeta>
                  Posted by {a.created_by}
                </AnnouncementMeta>
              </AnnouncementCard>
            ))}
          </div>
        )}
      </ContentContainer>
    </PageContainer>
  );
}