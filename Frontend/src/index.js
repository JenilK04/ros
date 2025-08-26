import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { AuthProvider } from './Context/authContext'; 
import { UserProvider } from './Context/userContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <AuthProvider> */}
      <UserProvider>   
      <App />
      </UserProvider>
    {/* </AuthProvider> */}
  </React.StrictMode>
);

reportWebVitals();
