// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [role, setRole] = useState(null);
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     setRole(localStorage.getItem('role'));
//     setToken(localStorage.getItem('token'));
//   }, []);

//   const login = (token, role) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('role', role);
//     setToken(token);
//     setRole(role);
//   };

//   const logout = () => {
//     localStorage.clear();
//     setToken(null);
//     setRole(null);
//   };

//   return (
//     <AuthContext.Provider value={{ role, token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
