import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Admin from './Components/Admin';
import Registration from './Components/Registration';
import Properties from './Components/Properties';
import Profile from './Components/profile';
import PropertyDetails from './Components/propertyDetails';
import ManageUsersPage from './Components/manageUsers-A';
import UserDetails from './Components/userDetails';
import PropertyInquiry from './Components/propertyInquiry';
import {ProtectedAdmin,ProtectedUser} from './Components/ProtectedRoutes'; 

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Accessible to everyone */}
          <Route path="/" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/properties" element={<ProtectedUser><Properties /></ProtectedUser>} />
          <Route path="/properties/:id" element={<ProtectedUser><PropertyDetails /></ProtectedUser>} />

          {/* Protected Routes for Admins Only */}
          <Route
            path="/admin"
            element={
              <ProtectedUser>
                <ProtectedAdmin allowedRole="admin">
                  <Admin />
                </ProtectedAdmin>
              </ProtectedUser>
            }
          />
          <Route
            path="/manageusers"
            element={
              <ProtectedUser>
                <ProtectedAdmin allowedRole="admin">
                  <ManageUsersPage />
                </ProtectedAdmin>
              </ProtectedUser>
            }
          />
          <Route
            path="/userdetails/:id"
            element={
              <ProtectedUser>
                <ProtectedAdmin allowedRole="admin">
                  <UserDetails />
                </ProtectedAdmin>
              </ProtectedUser>
            }
          />

          {/* Protected Routes for Authenticated Users (including Admins) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedUser>
                <Dashboard />
              </ProtectedUser>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedUser>
                <Profile />
              </ProtectedUser>
            }
          />
          {/* Add more protected user routes here */}

          <Route
            path="/property-inquiry"
            element={
              <ProtectedUser>
                <PropertyInquiry />
              </ProtectedUser>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;