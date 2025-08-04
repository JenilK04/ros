import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/authContext';

const ProtectedAdmin = ({ allowedRole, children }) => {
  const { role } = useAuth();

  // Wait for role to load on initial render
  if (role === null) return null; // or <div>Loading...</div>

  // If no role or wrong role, redirect to dashboard
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedAdmin;
