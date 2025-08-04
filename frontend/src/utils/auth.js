// src/utils/auth.js
export const checkAuth = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return {
    isAuthenticated: !!token,
    role: role || 'Student'
  };
};