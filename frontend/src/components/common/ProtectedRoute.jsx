import React from 'react';
import { Navigate } from 'react-router-dom';
import { checkAuth } from '../../utils/auth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role } = checkAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;