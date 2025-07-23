import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 shadow p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-white">ROS Ecosystem</div>

      <div className="flex items-center space-x-4">
        <a href="/dashboard"
          className="text-white hover:text-gray-300 font-medium"
        >
          Dashboard
        </a>

          {role === 'admin' &&(
          <a href="/admin"
            className="text-white hover:text-gray-300 font-medium"
          >
            Admin Panel
          </a>)}

          <a href="/properties"
            className="text-white hover:text-gray-300 font-medium"
          >
            Properties
          </a>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-blue-950 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
