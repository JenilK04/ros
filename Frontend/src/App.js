import { Suspense,lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Loading from './Components/loading'
import {ProtectedAdmin,ProtectedUser} from './Components/ProtectedRoutes'; 
import { LoadingProvider } from './Context/loadingContext';

const HomePage = lazy(() => import("./Components/home"));
const Login = lazy(() => import("./Components/User/Login"));
const Dashboard = lazy(() => import("./Components/User/Dashboard"));
const Admin = lazy(() => import("./Components/Admin/Admin"));
const Registration = lazy(() => import("./Components/User/Registration"));
const Properties = lazy(() => import("./Components/User/Properties"));
const Profile = lazy(() => import("./Components/User/profile"));
const PropertyDetails = lazy(() => import("./Components/User/propertyDetails"));
const ManageUsersPage = lazy(() => import("./Components/Admin/manageUsers-A"));
const UserDetails = lazy(() => import("./Components/Admin/userDetails"));
const Event = lazy(() => import("./Components/User/Event"));

function App() {
  return (
    <div>
      <BrowserRouter>
        <LoadingProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes - Accessible to everyone */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/properties" element={<ProtectedUser><Properties /></ProtectedUser>} />
              <Route path="/properties/:id" element={<ProtectedUser><PropertyDetails /></ProtectedUser>} />
              <Route path="/events" element={<ProtectedUser><Event /></ProtectedUser>} />

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
          </Suspense>
          </LoadingProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;