import React, { useState } from 'react';
import { useUser } from '../Context/userContext'; 
import Navbar from './navbar';
import {Mail,Phone,User,MapPin,BadgeCheck,BriefcaseBusiness,} from 'lucide-react';

const Profile = () => {
  const { user, loading } = useUser(); // Get user data from context
  const [imageError, setImageError] = useState(false);

  // We need to fetch this from the API along with other user details
  // Or, if it's separate, you might fetch it in a different useEffect
  const specialization = user?.specialization || [];

  if (loading) {
    return <div className="text-center mt-20">Loading profile...</div>;
  }

  // Handle case where user is not logged in
  if (!user) {
    return <div className="text-center mt-20">Please log in to view your profile.</div>;
  }

  return (
    <>
      <Navbar/>
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <User className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
          </div>
        </div>

        {/* Profile Content */}
        <section className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          {/* Profile Image */}
          <div className="flex justify-center mb-8">
            {user.photo && !imageError ? (
              <img
                src={user.photo}
                alt="Profile"
                onError={() => setImageError(true)}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className='mb-4'>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2">
              <BadgeCheck className="text-blue-600" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Full Name" value={user.firstName + " " + user.lastName} />
              <Input label="Role" value={user.role} />
              <Input label="Email" value={user.email} icon={<Mail className="text-gray-400 h-4 w-4" />} />
              <Input label="Phone" value={user.phone} icon={<Phone className="text-gray-400 h-4 w-4" />} />
              <Input label="User Type" value={user.userType} />
            </div>
          </div>

          {/* Address Info */}
          <div className='mb-4'>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2">
              <MapPin className="text-green-600" />
              Address Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input label="Street Address" value={user.address} />
              <Input label="City" value={user.city} />
              <Input label="State" value={user.state} />
              <Input label="ZIP Code" value={user.zip} />
              <Input label="Country" value={user.country} />
            </div>
          </div>

          {/* Professional Info */}
          {(user.userType === 'agent' || user.userType === 'developer') && (
            <div className='mb-12'>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 pb-2">
                <BriefcaseBusiness className="text-purple-600" />
                Professional Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="Company Name" value={user.companyName} />
                <Input label="License Number" value={user.licenseNumber} />
                <Input label="Years of Experience" value={user.experience} />
              </div>

              {/* Specialization */}
              {specialization.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Specializations</label>
                  <div className="flex flex-wrap gap-2">
                    {specialization.map((item, index) => (
                      <button
                        key={index}
                        className="bg-white text-black text-sm px-3 py-1 rounded-full shadow-sm border border-black"
                        disabled
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

// Reusable Input Component
const Input = ({ label, value, icon }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3 top-2.5">{icon}</span>}
      <input
        type="text"
        value={value || ''} // Use default value to avoid uncontrolled/controlled component warning
        readOnly
        className={`w-full px-4 py-2 rounded-md border bg-gray-100 text-gray-800 ${
          icon ? 'pl-10' : ''
        }`}
      />
    </div>
  </div>
);

export default Profile;