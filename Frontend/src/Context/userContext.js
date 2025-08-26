import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user on app load/refresh
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await API.get('auth/user/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data); // ✅ full profile from API
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Called after successful login
  const loginUser = async (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userData.role);

    try {
      const response = await API.get('auth/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      console.log(response.data) // ✅ instantly update with full profile
    } catch (error) {
      console.error("Failed to fetch full user after login", error);
      setUser(userData); // fallback if backend only gave partial user
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
