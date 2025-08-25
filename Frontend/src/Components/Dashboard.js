import React from 'react';
import Navbar from './navbar';
import { useUser } from '../Context/userContext';
import {Users, ClipboardCheck, Calendar, MessageCircle } from 'lucide-react';

const Dashboard = () => {
            const { user, loading } = useUser();
            
            if (loading) {
              return <div>Loading...</div>; // Show a loading indicator
            }
            if (!user) {
              // Handle the case where the user is not logged in or data is unavailable
              return <div>Please log in to view the dashboard.</div>;
            }


  return (
    <>
      <Navbar />
      <div className="p-4 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-[80vh]">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to Your Dashboard</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Welcome back, {user.firstName + " " + user.lastName}!</h2>
          <p className="text-gray-500">Here’s your quick summary and updates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card title="My Leads" icon={<Users className="h-8 w-8 text-blue-600" />} />
          <Card title="Tasks" icon={<ClipboardCheck className="h-8 w-8 text-green-600" />} />
          <Card title="Events" icon={<Calendar className="h-8 w-8 text-purple-600" />} />
          <Card title="Pulse Feedback" icon={<MessageCircle className="h-8 w-8 text-pink-600" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Activity Overview</h2>
            <p className="text-gray-500 text-sm">Graph/Stats will be displayed here.</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Upcoming Tasks</h2>
            <ul className="text-gray-600 text-sm list-disc pl-4">
              <li>Follow up with leads</li>
              <li>Prepare for property event</li>
              <li>Complete client reports</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Notifications</h2>
          <p className="text-gray-500 text-sm">No new notifications at this moment.</p>
        </div>
      </div>
    </>
  );
};

const Card = ({ title, icon }) => (
  <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer transform hover:scale-105">
    <div className="flex items-center space-x-4 mb-2">
      {icon}
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
    </div>
    <p className="text-gray-500 text-sm">Manage your {title.toLowerCase()} here.</p>
  </div>
);

export default Dashboard;
