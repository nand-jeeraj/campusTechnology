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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const MeetingForm = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
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

const MeetingsContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const MeetingsTitle = styled.h2`
  color: #2b6cb0;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const MeetingsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.thead`
  background-color: #ebf8ff;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #2d3748;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:nth-child(even) {
    background-color: #f7fafc;
  }

  &:hover {
    background-color: #ebf8ff;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #4a5568;
`;

const JoinLink = styled.a`
  color: #4299e1;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    text-decoration: underline;
    color: #3182ce;
  }
`;

export default function VideoMeetings() {
  const [form, setForm] = useState({ title: "", time: "", link: "" });
  const [meetings, setMeetings] = useState([]);

  const showAlert = (message, type) => {
    alert(`${type}: ${message}`);
  };

  const loadMeetings = async () => {
    try {
      const response = await fetch(`${BASE_URL}meetings`);
      const data = await response.json();
      setMeetings(data);
    } catch (err) {
      showAlert("Failed to load meetings", "error");
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.time || !form.link) {
      showAlert("All fields required", "warning");
      return;
    }

    try {
      await fetch(`${BASE_URL}meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form)
      });
      showAlert("Meeting created", "success");
      setForm({ title: "", time: "", link: "" });
      loadMeetings();
    } catch (err) {
      showAlert(
        "Failed to create meeting: " + (err.response?.data?.msg || "Error"),
        "error"
      );
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  return (
    <PageContainer>
      <ContentContainer>
        <MeetingForm
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FormTitle>Create New Meeting</FormTitle>
          <FormInput
            type="text"
            placeholder="Meeting Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <FormInput
            type="datetime-local"
            placeholder="Meeting Time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
          <FormInput
            type="text"
            placeholder="Meeting Link (Zoom/Google Meet etc)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <SubmitButton
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Meeting
          </SubmitButton>
        </MeetingForm>

        <MeetingsContainer>
          <MeetingsTitle>All Scheduled Meetings</MeetingsTitle>
          <MeetingsTable>
            <TableHeader>
              <tr>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Time</TableHeaderCell>
                <TableHeaderCell>Link</TableHeaderCell>
              </tr>
            </TableHeader>
            <tbody>
              {meetings.map((m) => (
                <TableRow key={m._id}>
                  <TableCell>{m.title}</TableCell>
                  <TableCell>{new Date(m.time).toLocaleString()}</TableCell>
                  <TableCell>
                    <JoinLink href={m.link} target="_blank" rel="noreferrer">
                      Join Meeting
                    </JoinLink>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </MeetingsTable>
        </MeetingsContainer>
      </ContentContainer>
    </PageContainer>
  );
}