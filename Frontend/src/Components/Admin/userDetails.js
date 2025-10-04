// src/components/UserDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../User/navbar";
import { Building, User, Mail, Phone, MapPin, RefreshCw } from "lucide-react";
import API from "../../services/api";

// Simple single-date picker
const SingleDatePicker = ({ selectedDate, onChange }) => {
  return (
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border rounded"
      max={new Date().toISOString().split("T")[0]} // prevent future dates
    />
  );
};

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pageViews, setPageViews] = useState([]);
  const [pageViewsLoading, setPageViewsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get(`/admin/users/${id}`);
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError(err.response?.data?.msg || "Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUserDetails();
  }, [id]);

  // Fetch page activity for selected date
  const fetchPageViews = async (date) => {
    if (!user?._id) return;
    setPageViewsLoading(true);
    try {
      const response = await API.get(
        `/analytics/user-events/${user._id}?date=${date}`
      );
      setPageViews(response.data || []);
    } catch (err) {
      console.error("Error fetching page activity:", err);
      setPageViews([]);
    } finally {
      setPageViewsLoading(false);
    }
  };

  // Fetch page views whenever user or date changes
  useEffect(() => {
    if (user?._id) fetchPageViews(selectedDate);
  }, [user?._id, selectedDate]);

  if (loading) return <div className="text-center mt-8">Loading user details...</div>;
  if (error) return <div className="text-center mt-8 text-red-600">{error}</div>;
  if (!user) return <div className="text-center mt-8">User not found.</div>;

  const isProfessional = user.userType?.includes("developer");
  const hasProfessionalDetails =
    isProfessional &&
    (user.companyName ||
      user.licenseNumber ||
      user.experience ||
      user.specialization?.length > 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center sm:text-left">
              User Profile: {user.firstName} {user.lastName}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:underline text-center sm:text-right"
            >
              &larr; Back to Admin
            </button>
          </div>

          {/* Profile Picture */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-gray-200">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt="User Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <User className="h-10 w-10 sm:h-12 sm:w-12 text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 border-b pb-2">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <p className="text-gray-700 font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <p className="text-gray-700 break-all">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <p className="text-gray-700">{user.phone || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Address Info */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 border-b pb-2">
                Address Information
              </h2>
              <div className="mt-4">
                {user.address || user.city || user.state || user.zip || user.country ? (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <p className="text-gray-700">
                      {user.address && user.address + ", "}
                      {user.city && user.city + ", "}
                      {user.state && user.state}
                      {user.zip && " - " + user.zip}
                      {user.country && ", " + user.country}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No address information available.</p>
                )}
              </div>
            </div>

            {/* Professional Info */}
            {hasProfessionalDetails && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 border-b pb-2">
                  Professional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {user.companyName && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-gray-500" />
                      <p className="text-gray-700">Company: {user.companyName}</p>
                    </div>
                  )}
                  {user.licenseNumber && (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-700">License: {user.licenseNumber}</p>
                    </div>
                  )}
                  {user.experience && (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-700">
                        Years of Experience: {user.experience}
                      </p>
                    </div>
                  )}
                  {user.specialization?.length > 0 && (
                    <div className="flex flex-col space-y-2 col-span-2">
                      <p className="text-gray-700 font-medium">Specialization:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.specialization.map((spec, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Page Views / Activity */}
          <div className="max-w-4xl mx-auto mt-6 bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 border-b pb-2">
              Pages Visited
            </h2>

            {/* Filter / Refresh */}
            <div className="flex items-center gap-2 mt-2 mb-4">
              <SingleDatePicker
                selectedDate={selectedDate}
                onChange={(date) => setSelectedDate(date)}
              />
              <button
                onClick={() => fetchPageViews(selectedDate)}
                className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-100"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
              {pageViewsLoading ? (
                <p className="text-gray-500 text-sm">Loading page visits...</p>
              ) : pageViews.length === 0 ? (
                <p className="text-gray-500 text-sm">No page activity recorded.</p>
              ) : (
                pageViews
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // newest first
                  .map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 p-2 rounded shadow-sm flex justify-between items-center"
                    >
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">
                          {event?.properties?.$current_url
                            ? event.properties.$current_url
                                .split("/")
                                .filter(Boolean)
                                .pop() // last part of path as page name
                            : "Unknown Page"}
                        </span>
                      </p>
                      <span className="text-xs text-gray-500">
                        {event?.timestamp
                          ? new Date(event.timestamp).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetails;
