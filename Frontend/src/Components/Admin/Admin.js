import React from 'react';
import Navbar from '../User/navbar';
import { BarChart2, UserCog, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const adminName = 'Admin';
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-[80vh]">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Admin Panel</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Welcome, {adminName}!</h2>
          <p className="text-gray-500">Manage system settings, users, and reports.</p>
        </div>

        {/* Cards with gradient colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card
            title="Manage Users"
            icon={<UserCog className="h-8 w-8 text-white" />}
            onClick={() => navigate('/manageusers')}
            gradient="from-blue-500 to-indigo-600"
          />
          <Card
            title="Reports & Analytics"
            icon={<BarChart2 className="h-8 w-8 text-white" />}
            onClick={() => navigate('/analytics')}
            gradient="from-green-400 to-emerald-600"
          />
          <Card
            title="Events"
            icon={<Calendar className="h-8 w-8 text-white" />}
            onClick={() => navigate('/events')}
            gradient="from-orange-400 to-pink-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">System Activity Overview</h2>
            <p className="text-gray-500 text-sm">Admin analytics/graph placeholders here.</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Admin Notifications</h2>
            <p className="text-gray-500 text-sm">No new alerts.</p>
          </div>
        </div>
      </div>
    </>
  );
};

const Card = ({ title, icon, onClick, gradient }) => (
  <div
    className={`relative overflow-hidden p-4 rounded-xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300 bg-gradient-to-r ${gradient}`}
    onClick={onClick}
  >
    {/* Shimmer effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse"></div>

    <div className="relative z-10 flex items-center space-x-4 mb-2">
      {icon}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
    <p className="relative z-10 text-white/90 text-sm">
      Control and manage {title.toLowerCase()} here.
    </p>
  </div>
);

export default Admin;
