import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import styled from "styled-components";
import { BASE_URL } from '../../services/api';

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2d3748;
`;

const Header = styled(motion.h2)`
  font-size: 2.5rem;
  color: #2b6cb0;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`;

const Section = styled(motion.section)`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  color: #4a5568;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyMessage = styled(motion.p)`
  color: #718096;
  font-style: italic;
  text-align: center;
  padding: 1rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled(motion.li)`
  background: #f7fafc;
  border-left: 4px solid #4299e1;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: #ebf8ff;
    transform: translateX(5px);
  }
`;

const ItemTitle = styled.span`
  font-weight: 600;
  color: #2d3748;
  flex: 1;
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #4a5568;
  font-size: 0.875rem;
`;

const ItemType = styled.span`
  background: ${props => props.$type === 'quiz' ? '#4299e1' : '#48bb78'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.$delete ? '#f56565' : '#4299e1'};
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
  margin-left: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$delete ? '#e53e3e' : '#3182ce'};
  }
`;

const LoadingSkeleton = styled(motion.div)`
  background: #e2e8f0;
  border-radius: 0.25rem;
  height: 3rem;
  margin-bottom: 0.75rem;
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

function QuizAssignmentManagement() {
  const [quizAssignments, setQuizAssignments] = useState([]);
  const [scheduledQuizzes, setScheduledQuizzes] = useState([]);
  const [scheduledAssignments, setScheduledAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingScheduled, setLoadingScheduled] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
const [editForm, setEditForm] = useState({
  title: '',
  start_time: '',
  end_time: '',
  duration_minutes: ''
});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingScheduled(true);
        
        const [quizzesRes, assignmentsRes, scheduledQuizzesRes, scheduledAssignmentsRes] = await Promise.all([
          axios.get(`${BASE_URL}quizzes`),
          axios.get(`${BASE_URL}assignments`),
          axios.get(`${BASE_URL}scheduled-quizzes`),
          axios.get(`${BASE_URL}scheduled-assignments`)
        ]);
        
        const combined = [
          ...quizzesRes.data.map(item => ({ ...item, type: 'quiz' })),
          ...assignmentsRes.data.map(item => ({ ...item, type: 'assignment' }))
        ];
        
        setQuizAssignments(combined);
        setScheduledQuizzes(scheduledQuizzesRes.data.map(item => ({ ...item, type: 'quiz' })));
        setScheduledAssignments(scheduledAssignmentsRes.data.map(item => ({ ...item, type: 'assignment' })));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setLoadingScheduled(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      let endpoint = '';
        if (type === 'quiz') {
        if (scheduledQuizzes.find(q => q._id === id)) {
            endpoint = `${BASE_URL}scheduled-quizzes/${id}`;
        } else {
            endpoint = `${BASE_URL}quizzes/${id}`;
        }
        } else {
        if (scheduledAssignments.find(a => a._id === id)) {
            endpoint = `${BASE_URL}scheduled-assignments/${id}`;
        } else {
            endpoint = `${BASE_URL}assignments/${id}`;
        }
        }
      
      await axios.delete(endpoint);
      setQuizAssignments(prev => prev.filter(item => item._id !== id));
      setScheduledQuizzes(prev => prev.filter(item => item._id !== id));
      setScheduledAssignments(prev => prev.filter(item => item._id !== id));
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const convertUTCToIST = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // IST is UTC+5:30
  date.setHours(date.getHours() + 5);
  date.setMinutes(date.getMinutes() + 30);
  return date.toISOString().substring(0, 16);
};

const handleEdit = (item) => {
  setEditingItem(item);
  setEditForm({
    title: item.title || '',
    start_time: item.start_time ? convertUTCToIST(item.start_time) : '',
    end_time: item.end_time ? convertUTCToIST(item.end_time) : '',
    duration_minutes: item.duration_minutes || ''
  });
};

// Helper function to format datetime for input[type="datetime-local"]
const formatDateTimeForInput = (dateString) => {
  const date = new Date(dateString);
  const isoString = date.toISOString();
  return isoString.substring(0, 16); // YYYY-MM-DDTHH:MM
};

const handleEditSubmit = async () => {
  if (!editingItem) return;

  let endpoint = "";
  const payload = {
    title: editForm.title,
    start_time: editForm.start_time,
    end_time: editForm.end_time,
    duration_minutes: parseInt(editForm.duration_minutes),
  };

  if (editingItem.type === "quiz") {
    if (scheduledQuizzes.find(q => q._id === editingItem._id)) {
      endpoint = `${BASE_URL}scheduled-quizzes/${editingItem._id}`;
    } else {
      alert("Edit not available for non-scheduled quizzes");
      return;
    }
  } else if (editingItem.type === "assignment") {
    if (scheduledAssignments.find(a => a._id === editingItem._id)) {
      endpoint = `${BASE_URL}scheduled-assignments/${editingItem._id}`;
    } else {
      alert("Edit not available for non-scheduled assignments");
      return;
    }
  }

  try {
    await axios.put(endpoint, payload);
    alert("Updated successfully");
    setEditingItem(null);
    window.location.reload();
  } catch (err) {
    console.error("Edit failed", err);
    alert("Failed to update");
  }
};



  return (
    <Container>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Quiz & Assignment Management
      </Header>
      
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SectionTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Manage Quizzes & Assignments
        </SectionTitle>

        {loading ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={`skeleton-${i}`} variants={itemVariants} />
            ))}
          </motion.div>
        ) : quizAssignments.length === 0 ? (
          <EmptyMessage
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No quizzes or assignments found
          </EmptyMessage>
        ) : (
          <List>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {quizAssignments.map((item, idx) => (
                <ListItem
                  key={`item-${idx}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemMeta>
                    <ItemType $type={item.type}>
                      {item.type}
                    </ItemType>
                    {item.duration_minutes && (
                      <span>{item.duration_minutes} mins</span>
                    )}
                    {item.start_time && item.end_time && (
                      <span>
                        {new Date(item.start_time).toLocaleDateString()} - {new Date(item.end_time).toLocaleDateString()}
                      </span>
                    )}
                    
                    <ActionButton
                      $delete
                      onClick={() => handleDelete(item._id, item.type)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </ActionButton>
                  </ItemMeta>
                </ListItem>
              ))}
            </motion.div>
          </List>
        )}
      </Section>

      {/* Scheduled Quizzes Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SectionTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Scheduled Quizzes
        </SectionTitle>

        {loadingScheduled ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {[1, 2].map((i) => (
              <LoadingSkeleton key={`scheduled-quiz-skeleton-${i}`} variants={itemVariants} />
            ))}
          </motion.div>
        ) : scheduledQuizzes.length === 0 ? (
          <EmptyMessage
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No scheduled quizzes found
          </EmptyMessage>
        ) : (
          <List>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {scheduledQuizzes.map((item, idx) => (
                <ListItem
                  key={`scheduled-quiz-${idx}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemMeta>
                    <ItemType $type={item.type}>
                      {item.type}
                    </ItemType>
                    {item.duration_minutes && (
                      <span>{item.duration_minutes} mins</span>
                    )}
                    {item.start_time && item.end_time && (
                      <span>
                        {new Date(item.start_time).toLocaleDateString()} - {new Date(item.end_time).toLocaleDateString()}
                      </span>
                    )}
                    <ActionButton
                      onClick={() => handleEdit(item)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </ActionButton>
                    <ActionButton
                      $delete
                      onClick={() => handleDelete(item._id, item.type)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </ActionButton>
                  </ItemMeta>
                </ListItem>
              ))}
            </motion.div>
          </List>
        )}
      </Section>

      {/* Scheduled Assignments Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SectionTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Scheduled Assignments
        </SectionTitle>

        {loadingScheduled ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {[1, 2].map((i) => (
              <LoadingSkeleton key={`scheduled-assignment-skeleton-${i}`} variants={itemVariants} />
            ))}
          </motion.div>
        ) : scheduledAssignments.length === 0 ? (
          <EmptyMessage
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No scheduled assignments found
          </EmptyMessage>
        ) : (
          <List>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {scheduledAssignments.map((item, idx) => (
                <ListItem
                  key={`scheduled-assignment-${idx}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemMeta>
                    <ItemType $type={item.type}>
                      {item.type}
                    </ItemType>
                    {item.duration_minutes && (
                      <span>{item.duration_minutes} mins</span>
                    )}
                    {item.start_time && item.end_time && (
                      <span>
                        {new Date(item.start_time).toLocaleDateString()} - {new Date(item.end_time).toLocaleDateString()}
                      </span>
                    )}
                    <ActionButton
                      onClick={() => handleEdit(item)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </ActionButton>
                    <ActionButton
                      $delete
                      onClick={() => handleDelete(item._id, item.type)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </ActionButton>
                  </ItemMeta>
                </ListItem>
              ))}
            </motion.div>
          </List>
        )}
      </Section>

      {/* Edit Modal */}
{editingItem && (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        width: '100%',
        maxWidth: '500px'
      }}
    >
      <h3>Edit {editingItem.type}</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
        <input
          type="text"
          value={editForm.title}
          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Time</label>
        <input
          type="datetime-local"
          value={editForm.start_time}
          onChange={(e) => setEditForm({...editForm, start_time: e.target.value})}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>End Time</label>
        <input
          type="datetime-local"
          value={editForm.end_time}
          onChange={(e) => setEditForm({...editForm, end_time: e.target.value})}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Duration (minutes)</label>
        <input
          type="number"
          value={editForm.duration_minutes}
          onChange={(e) => setEditForm({...editForm, duration_minutes: e.target.value})}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <ActionButton 
          onClick={() => setEditingItem(null)}
          style={{ background: '#718096' }}
        >
          Cancel
        </ActionButton>
        <ActionButton 
          onClick={handleEditSubmit}
        >
          Save Changes
        </ActionButton>
      </div>
    </motion.div>
  </motion.div>
)}

    </Container>
  );
}

export default QuizAssignmentManagement;