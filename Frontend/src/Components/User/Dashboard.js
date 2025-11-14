import React from 'react';
import Navbar from './navbar';
import ActivityOverview from './activityOverviewCard';
import { useUser } from '../../Context/userContext';
import Notifications from './notification';
import { Users, Calendar, NewspaperIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view the dashboard.</div>;

  return (
    <>
      <Navbar />
      <div className="p-4  min-h-[80vh]">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to Your Dashboard</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Welcome back, {user.firstName + " " + user.lastName}!
          </h2>
          <p className="text-gray-500">Here’s your quick summary and updates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card
              title="My Leads"
              icon={<Users className="h-8 w-8" />}
              onClick={() => navigate('/myleads')}
              color="linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%)" // cyan → blue
            />
            {/* <Card
              title="Tasks"
              icon={<ClipboardCheck className="h-8 w-8" />}
              color="linear-gradient(135deg, #FACC15 0%, #F97316 100%)" // yellow → orange
            /> */}
            <Card
              title="Events"
              icon={<Calendar className="h-8 w-8" />}
              color="linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)" // light purple → deep purple
              onClick={() => navigate('/events')}
            />
            <Card
              onClick={() => navigate('/news')}
              title="Housing Market News"
              icon={<NewspaperIcon className="h-8 w-8" />}
              color="linear-gradient(135deg, #34D399 0%, #10B981 100%)" // light green → green
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Activity Overview</h2>
            <div className="mt-4">
              <ActivityOverview />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow max-h-60">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 sticky top-0 z-10">
              Notifications
            </h2>
            <div className="mt-2 bg-white overflow-y-auto">
              <Notifications userId={user._id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Card component with shimmer effect
const Card = ({ title, icon, onClick, color }) => (
  <div
    className="relative p-4 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 cursor-pointer overflow-hidden"
    onClick={onClick}
    style={{ background: color, color: 'white' }}
  >
    {/* Shimmer Overlay */}
    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 transform -translate-x-full animate-shimmer pointer-events-none rounded-xl"></div>

    <div className="flex items-center space-x-4 mb-2 relative z-10">
      <div className="p-2 rounded-full bg-white/20 shadow-lg">
        {React.cloneElement(icon, { className: 'h-8 w-8 text-white drop-shadow-lg' })}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
    <p className="text-white text-sm relative z-10">
      See/Manage your {title.toLowerCase()} here.
    </p>
  </div>
);

export default Dashboard;
