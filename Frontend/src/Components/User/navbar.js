import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { LogOut, Building, Menu, X } from "lucide-react";
import { useUser } from "../../Context/userContext"; // ⬅️ import your context

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useUser(); // ⬅️ get user & logout from context
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
    setMenuOpen(false);
   
  };

  // Common class for NavLink
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-white font-bold bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-md block"
      : "text-white hover:text-gray-300 font-medium block";

  return (
    <nav className="bg-gradient-to-br from-blue-600 to-indigo-800 sticky top-0 z-50 shadow p-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Building className="text-white" />
          <div className="text-xl font-bold text-white">ROS Ecosystem</div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
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

          <NavLink to="/projects" className={linkClass}>
            Projects
          </NavLink>

          {user?.role === "user" && (
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:from-blue-600 hover:to-indigo-800 hover:font-bold transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Links */}
      {menuOpen && (
        <div className="flex flex-col mt-4 space-y-3 md:hidden">
          {user?.role === "user" && (
            <NavLink to="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
              Admin Panel
            </NavLink>
          )}

          <NavLink to="/properties" className={linkClass} onClick={() => setMenuOpen(false)}>
            Properties
          </NavLink>

          <NavLink to="/projects" className={linkClass} onClick={() => setMenuOpen(false)}>
            Projects
          </NavLink>

          {user?.role === "user" && (
            <NavLink to="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>
              Profile
            </NavLink>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:from-blue-600 hover:to-indigo-800 hover:font-bold transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
