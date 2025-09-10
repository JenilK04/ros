import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useUser } from '../../Context/userContext';  

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post('/auth/login', { email, password });
      console.log('Login success:', response.data);

      const { token, role, user } = response.data;
      await loginUser(user || {}, token);

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data);
      alert(error.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <>
      {/* Top Navbar (fixed header) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-3 sm:py-0 text-center sm:text-left">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-white" />
              <span className="text-lg sm:text-xl font-bold text-white">
                ROS-Real Estate EcoSystem
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-200 mt-2 sm:mt-0">
              Join Our Real Estate Network
            </div>
          </div>
        </div>
      </div>

      {/* Main Login Section */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 sm:px-6">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-sm sm:max-w-md">
          <div className="flex items-center space-x-2 mb-6 justify-center sm:justify-start">
            <Building className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              ROS Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 w-full border border-gray-300 rounded-md py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition text-sm sm:text-base"
            >
              Login
            </button>
          </form>

          {/* Register link */}
          <p className="text-xs sm:text-sm text-gray-600 mt-4 text-center">
            Don’t have an account?{' '}
            <span
              onClick={() => navigate('/registration')}
              className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
