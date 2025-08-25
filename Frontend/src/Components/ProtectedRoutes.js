import { Navigate } from 'react-router-dom';
import { useUser } from '../Context/userContext';

// This component protects routes for all authenticated users
const ProtectedUser = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to the login page if no token is found
    return <Navigate to="/" replace />;
  }
  
  // Render the child component (the protected page)
  return children;
};

// This component protects routes specifically for Admins
const ProtectedAdmin = ({ children }) => {
  const { user } = useUser();

  // If auth is still loading, return nothing
  if (user === null) return null;

  // A user must be an 'admin' to access this route.
  // We first check if the user is authenticated at all.
  if (user && user.role === 'admin') {
      return children;

  }
    return <Navigate to="/dashboard" replace />;
};


// Export both components using ES module syntax
export { ProtectedAdmin, ProtectedUser };