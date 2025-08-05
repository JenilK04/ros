import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This effect runs once when the app loads to check for a logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // You would typically have a function here to check for a token in
        // cookies or localStorage and attach it to the request header.
        const token = localStorage.getItem('token');
        if (token) {
          // Assuming your API has an endpoint to get the current user's details
          const response = await API.get('auth/user/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
        // Clear invalid token if fetching fails
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const loginUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);