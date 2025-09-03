import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Components/User/Login';
import Dashboard from './Components/User/Dashboard';
import Admin from './Components/Admin/Admin';
import Registration from './Components/User/Registration';
import Properties from './Components/User/Properties';
import Profile from './Components/User/profile';
import PropertyDetails from './Components/User/propertyDetails';
import ManageUsersPage from './Components/Admin/manageUsers-A';
import UserDetails from './Components/Admin/userDetails';
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;