import React from 'react';
import Navbar from '../User/navbar';
import { Settings, BarChart2, UserCog, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    
  const adminName = 'Admin';
const navigate = useNavigate()
  return (
    <>
      <Navbar />
      <div className="p-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-[80vh]">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Admin Panel</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Welcome, {adminName}!</h2>
          <p className="text-gray-500">Manage system settings, users, and reports.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" >
          <Card title="Manage Users" icon={<UserCog className="h-8 w-8 text-blue-600"/>} onClick={() => navigate('/manageusers')} />
          <Card title="Reports & Analytics" icon={<BarChart2 className="h-8 w-8 text-green-600" />} />
          <Card title="Events" icon={<Calendar className="h-8 w-8 text-pink-600" />}  onClick={() => navigate('/events')}/>
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

const Card = ({ title, icon, onClick }) => (
  <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer transform hover:scale-105" onClick={onClick}>
    <div className="flex items-center space-x-4 mb-2">
      {icon}
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
    </div>
    <p className="text-gray-500 text-sm">Control and manage {title.toLowerCase()} here.</p>
  </div>
);

export default Admin;
