import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import api from "../services/api";
import { BASE_URL } from "../services/api";
import { AnimatePresence } from "framer-motion";

// Styled Components
const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
`;

const ProfileTitle = styled(motion.h1)`
  font-size: 2rem;
  margin-bottom: 0;
  position: relative;
  padding-bottom: 1rem;
  color: ${props => props.role === 'faculty' ? '#c53030' : '#2b6cb0'};

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: ${props => props.role === 'faculty' 
      ? 'linear-gradient(90deg, #f56565, #e53e3e)' 
      : 'linear-gradient(90deg, #4299e1, #3676bbff)'};
    border-radius: 2px;
  }
`;

const ProfileCard = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  position: relative;
  border-top: 4px solid ${props => props.role === 'faculty' ? '#f56565' : '#2b6cb0'};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }
`;

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const AvatarImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid ${props => props.role === 'faculty' ? '#fed7d7' : '#ebf8ff'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AvatarPlaceholder = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: ${props => props.role === 'faculty' 
    ? 'linear-gradient(135deg, #fed7d7, #feb2b2)' 
    : 'linear-gradient(135deg, #ebf8ff, #bee3f8)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.role === 'faculty' ? '#c53030' : '#2b6cb0'};
  font-size: 4rem;
  font-weight: bold;
  border: 4px solid ${props => props.role === 'faculty' ? '#fed7d7' : '#ebf8ff'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailItem = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #edf2f7;
  position: relative;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  &::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 0;
    height: 100%;
    width: 3px;
    background: ${props => props.role === 'faculty' ? '#f56565' : '#2b6cb0'};
    border-radius: 3px;
  }
`;

const DetailLabel = styled.p`
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.role === 'faculty' ? '#f56565' : '#2b6cb0'};
  }
`;

const DetailValue = styled.p`
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const EditButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: ${props => props.role === 'faculty' 
    ? 'linear-gradient(135deg, #f56565, #e53e3e)' 
    : 'linear-gradient(135deg, #2b6cb0, #3676bbff)'};
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 200px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    bottom: -50%;
    left: -50%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0));
    transform: rotateZ(60deg) translate(-5em, 7.5em);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    
    &::after {
      animation: shine 1.5s forwards;
    }
  }

  @keyframes shine {
    100% {
      transform: rotateZ(60deg) translate(1em, -9em);
    }
  }
`;

const RoleBadge = styled.span`
  background: ${props => props.role === 'faculty' 
    ? 'linear-gradient(135deg, #f56565, #e53e3e)' 
    : 'linear-gradient(135deg, #2b6cb0, #3676bbff)'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '${props => props.role === 'faculty' ? '👨‍🏫' : '👨‍🎓'}';
    font-size: 0.9rem;
  }
`;

const DashboardButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: ${props => props.role === 'faculty' 
    ? 'linear-gradient(135deg, #f56565, #e53e3e)' 
    : 'linear-gradient(135deg, #2b6cb0, #3676bbff)'};
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    bottom: -50%;
    left: -50%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0));
    transform: rotateZ(60deg) translate(-5em, 7.5em);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    
    &::after {
      animation: shine 1.5s forwards;
    }
  }

  @keyframes shine {
    100% {
      transform: rotateZ(60deg) translate(1em, -9em);
    }
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #ebf8ff;
  border-top: 4px solid ${props => props.role === 'faculty' ? '#f56565' : '#4299e1'};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CourseBadge = styled.span`
  background: ${props => props.role === 'faculty' ? '#fff5f5' : '#f0fff4'};
  color: ${props => props.role === 'faculty' ? '#9b2c2c' : '#3676bbff'};
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-flex;
  align-items: center;
  border: 1px solid ${props => props.role === 'faculty' ? '#fed7d7' : '#c6f6d5'};

  &::before {
    content: '${props => props.role === 'faculty' ? '📚' : '🎓'}';
    margin-right: 0.25rem;
    font-size: 0.8rem;
  }
`;

const PasswordChangeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PasswordChangeTitle = styled.h3`
  color: ${props => props.role === 'faculty' ? '#c53030' : '#2b6cb0'};
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  position: relative;
  padding-bottom: 0.5rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: ${props => props.role === 'faculty' 
      ? 'linear-gradient(90deg, #f56565, #e53e3e)' 
      : 'linear-gradient(90deg, #4299e1, #3676bbff)'};
    border-radius: 2px;
  }
`;

const PasswordChangeButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.role === 'faculty' ? '#f56565' : '#3676bbff'};
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.role === 'faculty' ? '#e53e3e' : '#2b6cb0'};
    transform: translateY(-1px);
  }
`;

const PasswordInputContainer = styled(motion.div)`
  position: relative;
  margin-bottom: 1rem;
`;

const PasswordInput = styled.input`
  width: 80%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f8fafc;

  &:focus {
    outline: none;
    border-color: ${props => props.role === 'faculty' ? '#f56565' : '#2b6cb0'};
    box-shadow: 0 0 0 3px ${props => props.role === 'faculty' 
      ? 'rgba(245, 101, 101, 0.2)' 
      : 'rgba(72, 187, 120, 0.2)'};
    background: white;
  }
`;

const EyeButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #718096;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.role === 'faculty' ? '#c53030' : '#2b6cb0'};
    background: ${props => props.role === 'faculty' ? '#fff5f5' : '#f0fff4'};
  }
`;

const PasswordFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1.5rem;
`;

  const handleDashboardClick = () => {
    window.location.href = "/"; 
  };

const PasswordChangeContainer = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-top: 2rem;
  border-top: 4px solid ${props => props.role === 'faculty' ? '#f56565' : '#2b6cb0'};
  overflow: hidden;
`;

// Add these variants for the animations
const containerVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: "auto",
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const inputVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userRole = (localStorage.getItem("user_role") || "student").toLowerCase();
const [showPasswordChange, setShowPasswordChange] = useState(false);
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          navigate("/auth/login-options");
          return;
        }

        const email = localStorage.getItem("user_email");
        const name = localStorage.getItem("user_name");

        const query = new URLSearchParams({ user_id, email, name }).toString();
        const response = await api.get(`${BASE_URL}api/user-profile?${query}`);

        setUserData({
          ...response.data,
          role: response.data.role.toLowerCase()
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <ProfileContainer>
        <LoadingContainer>
          <LoadingSpinner role={userRole} />
        </LoadingContainer>
      </ProfileContainer>
    );
  }

  if (!userData) {
    return (
      <ProfileContainer>
        <p>No user data available</p>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileTitle 
          role={userRole}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {userRole === 'faculty' ? 'Faculty Profile' : 'Student Profile'}
        </ProfileTitle>
        
        <DashboardButton 
          role={userRole}
          onClick={handleDashboardClick}
          as={Link}
          to="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <DashboardIcon/>
          Main Dashboard
        </DashboardButton>
      </ProfileHeader>

      <ProfileCard
        role={userRole}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AvatarContainer>
          {userData.image ? (
            <AvatarImage 
              src={userData.image}
              alt="Profile"
              role={userRole}
            />
          ) : (
            <AvatarPlaceholder role={userRole}>
              {userData.name.charAt(0).toUpperCase()}
            </AvatarPlaceholder>
          )}
          <EditButton 
            role={userRole}
            onClick={() => alert("Edit profile functionality coming soon!")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Edit Profile
          </EditButton>
        </AvatarContainer>

        <DetailsContainer>
          <DetailItem role={userRole}>
            <DetailLabel role={userRole}>Full Name</DetailLabel>
            <DetailValue>
              {userData.name}
              <RoleBadge role={userRole}>{userData.role}</RoleBadge>
            </DetailValue>
          </DetailItem>

          <DetailItem role={userRole}>
            <DetailLabel role={userRole}>Email Address</DetailLabel>
            <DetailValue>{userData.email}</DetailValue>
          </DetailItem>

          <DetailItem role={userRole}>
            <DetailLabel role={userRole}>Account Created</DetailLabel>
            <DetailValue>
              {new Date(userData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </DetailValue>
          </DetailItem>

          <DetailItem role={userRole}>
            <DetailLabel role={userRole}>
              {userRole === 'student' ? 'Enrolled Courses' : 'Teaching Courses'}
            </DetailLabel>
            <DetailValue>
              {userData.courses?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {userData.courses.map((course, index) => (
                    <CourseBadge key={index} role={userRole}>
                      {course}
                    </CourseBadge>
                  ))}
                </div>
              ) : (
                <CourseBadge role={userRole}>
                  {userRole === 'student' ? 'No courses enrolled' : 'No courses assigned'}
                </CourseBadge>
              )}
            </DetailValue>
          </DetailItem>
          <PasswordChangeContainer 
            role={userRole}
            initial="visible"
            animate="visible"
            variants={containerVariants}
          >
            <PasswordChangeHeader>
              <PasswordChangeTitle role={userRole}>
                Password Settings
              </PasswordChangeTitle>
              {!showPasswordChange ? (
                <EditButton 
                  role={userRole}
                  onClick={() => setShowPasswordChange(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ maxWidth: '200px', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  Change Password
                </EditButton>
              ) : null}
            </PasswordChangeHeader>

            <AnimatePresence mode="wait">
              {showPasswordChange ? (
                <PasswordChangeContainer
                  role={userRole}
                  key="password-form"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                >
                <PasswordFormContainer>
                <PasswordInputContainer
                  role={userRole}
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                >

                  <PasswordInput
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    role={userRole}
                  />
                  <EyeButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                  </EyeButton>
                </PasswordInputContainer>

                <PasswordInputContainer
                  role={userRole}
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                >

                  <PasswordInput
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    role={userRole}
                  />
                  <EyeButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? "👁️" : "👁️‍🗨️"}
                  </EyeButton>
                </PasswordInputContainer>

                <PasswordInputContainer
                  role={userRole}
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                >

                  <PasswordInput
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    role={userRole}
                  />
                  <EyeButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </EyeButton>
                </PasswordInputContainer>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <EditButton 
                    role={userRole}
                    onClick={() => {
                      // Add your password change logic here
                      alert('Password change functionality would be implemented here');
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ maxWidth: 'none', flex: 1 }}
                  >
                    Save Changes
                  </EditButton>
                  <EditButton 
                    role={userRole}
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    style={{ 
                      background: 'white',
                      color: userRole === 'faculty' ? '#c53030' : '#2b6cb0',
                      border: `1px solid ${userRole === 'faculty' ? '#fed7d7' : '#bee3f8'}`,
                      flex: 1
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </EditButton>
                </div>
              </PasswordFormContainer>
              </PasswordChangeContainer>
            ) : (
              <motion.div
                key="password-static-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DetailValue style={{ color: '#718096', fontSize: '0.875rem' }}>
                  Last changed: {new Date().toLocaleDateString()}
                </DetailValue>
              </motion.div>
            )}
          </AnimatePresence>
          </PasswordChangeContainer>
        </DetailsContainer>
      </ProfileCard>
    </ProfileContainer>
  );
}

export default ProfilePage;