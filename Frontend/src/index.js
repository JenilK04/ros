import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PostHogProvider } from 'posthog-js/react';
// import { AuthProvider } from './Context/authContext'; 
import { UserProvider } from './Context/userContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={process.env.REACT_APP_POSTHOG_KEY}
      options={{
        api_host: process.env.REACT_APP_POSTHOG_HOST,
        autocapture: true,
        defaults: '2025-05-24',
        capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
        debug: process.env.NODE_ENV === "development",
      }}
    >
      {/* <AuthProvider> */}
        <UserProvider>   
          <App />
        </UserProvider>
      {/* </AuthProvider> */}
    </PostHogProvider>
  </React.StrictMode>
);

reportWebVitals(); 