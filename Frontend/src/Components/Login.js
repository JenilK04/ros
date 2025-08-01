import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post('/auth/login', { email, password});
      console.log('Login success:', response.data);

      // Save token and role
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('name',response.data.name)
      localStorage.setItem('email',response.data.email)
      localStorage.setItem('phone', response.data.phone);
      localStorage.setItem('userType', response.data.userType);
      localStorage.setItem('address', response.data.address);
      localStorage.setItem('city', response.data.city);
      localStorage.setItem('state', response.data.state);
      localStorage.setItem('zip', response.data.zip);
      localStorage.setItem('country', response.data.country);
      localStorage.setItem('companyName', response.data.companyName);
      localStorage.setItem('licenseNumber', response.data.licenseNumber);
      localStorage.setItem('experience', response.data.experience);
      localStorage.setItem('specialization', JSON.stringify(response.data.specialization));
      localStorage.setItem('photo', response.data.photo);



      // Redirect based on role
      if (response.data.role === 'admin') {
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
      
    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">ROS-Real Estate EcoSystem</span>
            </div>
            <div className="text-sm text-gray-300">
            Join Our Real Estate Network
            </div>
          </div>
        </div>
      </div>
  
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-blue-200 to-indigo-200 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
        <div className="flex items-center space-x-2 mb-6">
          <Building className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">ROS Login</h2>
        </div> 
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 w-full border border-gray-300 rounded-md py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div> 

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10 w-full border border-gray-300 rounded-md py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
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
