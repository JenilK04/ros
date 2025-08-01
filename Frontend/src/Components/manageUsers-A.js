import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import API from '../services/api';
import { UserPlus, Search, Edit, Trash2, Ban } from 'lucide-react';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch all user data from the API on component load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // --- THIS LINE IS CHANGED ---
        // Change from API.post() to API.get()
        const response = await API.get('/admin/users'); 
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-gray-600">Loading users...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-red-600">{error}</div>
      </>
    );
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name;
    return (
      (fullName && fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });


  return (
    <>
      <Navbar />
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header and Controls */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition">
              <UserPlus className="h-5 w-5" />
              <span>Add New User</span>
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 flex space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* You can add dropdowns for filtering here */}
          </div>

          {/* User Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    {/* Updated to handle both name and firstName/lastName */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {/* Assuming 'status' is a field in your user model */}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status || 'Active'} {/* Default to 'Active' if status is not provided */}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-2"><Edit className="h-4 w-4" /></button>
                      <button className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                      {/* You'd have a function to call for each action */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageUsersPage;