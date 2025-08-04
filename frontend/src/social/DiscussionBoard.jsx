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

const DiscussionForm = styled(motion.div)`
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

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2rem 0;
`;

const DiscussionsTitle = styled.h2`
  color: #2b6cb0;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const PostContainer = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  border-left: 4px solid #4299e1;
`;

const PostTitle = styled.h3`
  color: #2d3748;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const PostBody = styled.p`
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const CommentDivider = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1rem 0;
`;

const CommentContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const CommentIcon = styled.span`
  color: #4299e1;
  margin-right: 0.75rem;
  font-size: 1rem;
`;

const CommentText = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  color: #2d3748;
`;

const FacultyBadge = styled.span`
  background-color: #ebf8ff;
  color: #2b6cb0;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const CommentForm = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const CommentButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3182ce;
  }
`;

const StudentBadge = styled.span`
  background-color: #f0fff4;
  color: #38a169;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

export default function DiscussionBoard() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: "", body: "" });
  const [commentText, setCommentText] = useState({});
  const name = localStorage.getItem("user_id") || "Anonymous User";
  const role = localStorage.getItem("user_role") || "Faculty";

  const showToast = (message, type) => {
    // Simple alert as a replacement for toast
    alert(`${type}: ${message}`);
  };

  const load = async () => {
    try {
      const response = await fetch(`${BASE_URL}discussions`);
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      showToast("Error loading discussions", "error");
      console.error("Error fetching discussions:", err);
    }
  };

  const submitPost = async () => {
    if (!form.title || !form.body) {
      showToast("Fill all fields", "warning");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE_URL}discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          body: form.body
        })
      });
      setForm({ title: "", body: "" });
      showToast("Discussion posted", "success");
      load();
    } catch (err) {
      showToast(
        "Failed to post: " + (err?.response?.data?.msg || "Something went wrong"),
        "error"
      );
      console.error("POST /discussions failed", err);
    }
  };

  const submitComment = async (id) => {
    const text = commentText[id];
    if (!text) return;

    try {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem("user_name") || "Anonymous User";
      const role = localStorage.getItem("user_role") || "Student";

      await fetch(`${BASE_URL}discussions/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-user-name": name,
          "x-user-role": role
        },
        body: JSON.stringify({ text })
      });
      setCommentText({ ...commentText, [id]: "" });
      showToast("Comment added", "success");
      load();
    } catch (err) {
      showToast(
        "Failed to comment: " + (err?.response?.data?.msg || "Something went wrong"),
        "error"
      );
      console.error("POST comment failed", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageContainer>
      <ContentContainer>
        <DiscussionForm
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FormTitle>Start a Discussion</FormTitle>
          <FormInput
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <FormTextArea
            placeholder="Message"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={4}
          />
          <SubmitButton
            onClick={submitPost}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Post Discussion
          </SubmitButton>
        </DiscussionForm>

        <Divider />

        <DiscussionsTitle>All Discussions</DiscussionsTitle>

        <div>
          {posts.map(p => (
            <PostContainer
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PostTitle>{p.title}</PostTitle>
              <PostBody>{p.body}</PostBody>
              
              <CommentDivider />
              
              {p.comments.map((c, i) => (
                <CommentContainer key={i}>
                  <CommentIcon>💬</CommentIcon>
                  <CommentText>
                    <CommentAuthor>{c.author}</CommentAuthor>
                      {console.log("Comment role:", c.author_role)}
                      {c.author_role === "Faculty" && <FacultyBadge>Faculty</FacultyBadge>}
                      {c.author_role === "Student" && <FacultyBadge>Student</FacultyBadge>}: {c.text}
                  </CommentText>
                </CommentContainer>
              ))}
              
              <CommentForm>
                <CommentInput
                  type="text"
                  placeholder="Add comment..."
                  value={commentText[p._id] || ""}
                  onChange={(e) =>
                    setCommentText({ ...commentText, [p._id]: e.target.value })
                  }
                />
                <CommentButton onClick={() => submitComment(p._id)}>
                  Comment
                </CommentButton>
              </CommentForm>
            </PostContainer>
          ))}
        </div>
      </ContentContainer>
    </PageContainer>
  );
}