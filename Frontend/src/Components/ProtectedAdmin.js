import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/authContext';

const ProtectedAdmin = ({ allowedRole, children }) => {
  const { role } = useAuth();

  if (role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default ProtectedAdmin;
