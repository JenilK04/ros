import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, Building } from 'lucide-react';
import { useUser } from '../Context/userContext'; // ⬅️ import your context

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useUser(); // ⬅️ get user & logout from context

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  // Common class for NavLink
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-white font-bold bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-md"
      : "text-white hover:text-gray-300 font-medium";

  return (
    <nav className="bg-gradient-to-br from-blue-600 to-indigo-800 shadow p-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Building className="text-white" />
        <div className="text-xl font-bold text-white">ROS Ecosystem</div>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        {user?.role === "user" && (
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
        )}

        {user?.role === "admin" && (
          <NavLink to="/admin" className={linkClass}>
            Admin Panel
          </NavLink>
        )}

        <NavLink to="/properties" className={linkClass}>
          Properties
        </NavLink>

        {user?.role === "user" && (
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-gradient-to-br from-blue-400 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-blue-600 to-indigo-800 transition"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
