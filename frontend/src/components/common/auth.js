// src/utils/auth.js
export const checkAuth = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return {
    isAuthenticated: !!token,
    role: role || 'Student'
  };
};

export const login = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('user_id', token.split('.')[0]); // Simple user ID extraction
};

export const logout = () => {
  localStorage.clear();
};