import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import posthog from 'posthog-js'; // <-- import PostHog

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Fetch latest user from backend on app load/refresh
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await API.get('auth/user/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
          localStorage.setItem("role", response.data.role);
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Called after successful login
  const loginUser = async (userData, token) => {
  try {
    const response = await API.get('auth/user/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(response.data);
    localStorage.setItem("user", JSON.stringify(response.data));
    localStorage.setItem("role", response.data.role);

    // 🔑 Identify user in PostHog
    posthog.identify(response.data._id, {
      email: response.data.email,
      name: response.data.firstName,
      role: response.data.role,
    });

  } catch (error) {
    console.error("Failed to fetch full user after login", error);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", userData.role || "user");

    // 🔑 Identify fallback user in PostHog
    if (userData._id) {
      posthog.identify(userData._id, {
        email: userData.email,
        name: userData.firstName,
        role: userData.role,
      });
    }
  }

  localStorage.setItem("token", token);
};


  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    posthog.reset();
  };

  // ✅ Add updateUser function
  const updateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem("user", JSON.stringify(updatedData));
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser, updateUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
