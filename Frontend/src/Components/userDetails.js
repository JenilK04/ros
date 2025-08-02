// src/components/UserDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import { Building, User, Mail, Phone, MapPin } from 'lucide-react';
import API from '../services/api'

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get(`/admin/users/${id}`, {
        });
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.response?.data?.msg || 'Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center mt-8">Loading user details...</div>;
  }
  if (error) {
    return <div className="text-center mt-8 text-red-600">{error}</div>;
  }
  if (!user) {
    return <div className="text-center mt-8">User not found.</div>;
  }

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">User Profile: {user.firstName} {user.lastName}</h1>
            <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
              &larr; Back to Admin
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
              {user.photo ? (
                <img src={user.photo} alt="User Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <p className="text-gray-700 font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <p className="text-gray-700">{user.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <p className="text-gray-700">{user.phone}</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <p className="text-gray-700">{user.address}, {user.city}, {user.state} - {user.zip}, {user.country}</p>
              </div>
            </div>

            {(user.userType === 'agent' || user.userType === 'developer') && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Professional Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-gray-500" />
                    <p className="text-gray-700">{user.companyName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-700">License: {user.licenseNumber}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-700">Years of Experience: {user.experience}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-700">Specialization:</p>
                    {user.specialization && user.specialization.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {user.specialization.map((spec, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm"
                        >
                          {spec}
                        </span>
                      ))}
                        </div>
                        ) : (
                          <p className="text-gray-500 text-sm mt-4">No specializations listed.</p>
                        )}
                      </div>
                  </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetails;