import React, { useState, useRef } from 'react';
import { Building, Home, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, X } from 'lucide-react';
import API from '../../services/api'; // Assuming this is correctly configured for axios
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    password: '',
    confirmPassword: '',
    userType: 'buyer',
    companyName: '',
    licenseNumber: '',
    experience: '',
    specialization: []
  });

  const [formErrors, setFormErrors] = useState({}); // NEW: State to hold form validation errors
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
      setFormErrors(prev => ({ ...prev, photo: '' })); // Clear photo error on selection
    } else {
      setPhoto(null);
      setPreview(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPreview(null);
    fileInputRef.current.value = null; // Clear the file input value
    setFormErrors(prev => ({ ...prev, photo: '' })); // Clear photo error on removal
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        specialization: checked
          ? [...prev.specialization, value]
          : prev.specialization.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // NEW: Clear error for the specific field when it changes
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const navigate = useNavigate();

  // NEW: Validation function
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/; // 10 to 15 digits for phone
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char

    // Basic Information
    if (!formData.firstName.trim()) errors.firstName = 'First Name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last Name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone Number is required.';
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Invalid phone number (10-15 digits).';
    }

    // Address Information
    if (!formData.address.trim()) errors.address = 'Street Address is required.';
    if (!formData.city.trim()) errors.city = 'City is required.';
    if (!formData.state.trim()) errors.state = 'State is required.';
    if (!formData.zip.trim()) errors.zip = 'ZIP Code is required.';
    if (!formData.country.trim()) errors.country = 'Country is required.';

    // Password
    if (!formData.password.trim()) {
      errors.password = 'Password is required.';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.';
    }
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm Password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    // Professional Information (conditional)
    if (formData.userType === 'agent' || formData.userType === 'developer') {
      if (!formData.companyName.trim()) errors.companyName = 'Company Name is required for agents/developers.';
      // Add more validation for licenseNumber, experience, specialization if needed
    }

    // Photo validation (optional, depending on if photo is mandatory)
    // For now, let's make it optional for registration
    // if (!photo) errors.photo = 'Profile photo is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) { // NEW: Run validation before submission
      alert('Please correct the errors in the form.');
      return; // Stop submission if validation fails
    }

    try {
      let base64Photo = '';
      if (photo) {
        // Convert photo to base64
        const reader = new FileReader();
        // Return a promise to wait for FileReader to complete
        base64Photo = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photo);
        });
      }

      const finalData = {
        ...formData,
        photo: base64Photo, // Add photo (Base64 string) to data
      };

      const res = await API.post('/auth/register', finalData);
      console.log('Registration success', res.data);
      alert('Registered successfully! Please login.');
      navigate('/');
    } catch (err) {
      console.error('Registration failed', err.response?.data);
      alert(err.response?.data?.msg || 'Registration failed');
    }
  };

  const userTypes = [
    { value: 'buyer', label: 'Property Buyer', icon: Home },
    { value: 'seller', label: 'Property Seller', icon: Building },
    { value: 'agent', label: 'Real Estate Agent', icon: User },
    { value: 'developer', label: 'Property Developer', icon: Building }
  ];

  const specializations = [
    'Residential Properties',
    'Commercial Properties',
    'Industrial Properties',
    'Land Development',
    'Property Management',
    'Investment Properties'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">ROS-Real Estate EcoSystem</span>
            </div>
            <div className="text-sm text-gray-300">
              Already have an account? <span className="text-blue-300 hover:text-blue-500 cursor-pointer font-medium" ><a href="\login">Sign In</a></span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Join Our Real Estate Network
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connect with buyers, sellers, agents, and developers in one powerful platform
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6"> {/* Changed to form tag and added onSubmit */}
              <div className="flex flex-col items-center space-y-2 mb-6">
                <div className="relative">
                  <div
                    onClick={triggerFileSelect}
                    className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 overflow-hidden shadow"
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                    ) : (
                      <User className="w-10 h-10 text-gray-500" />
                    )}
                  </div>

                  {preview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto();
                      }}
                      className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow hover:bg-red-100"
                      type="button"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </button>
                  )}
                </div>

                <span className="text-sm text-gray-500">
                  {preview ? 'Click to change photo' : 'Click to upload photo'}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {formErrors.photo && <p className="text-red-500 text-xs mt-1">{formErrors.photo}</p>}
              </div>



              <div className="space-y-6">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I am a...
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {userTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <label key={type.value} className="relative">
                          <input
                            type="radio"
                            name="userType"
                            value={type.value}
                            checked={formData.userType === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.userType === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <IconComponent className={`h-5 w-5 ${
                              formData.userType === type.value ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <span className={`text-sm font-medium ${
                              formData.userType === type.value ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {type.label}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required // HTML5 required, but our JS validation handles it
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="John"
                      />
                    </div>
                    {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Doe"
                      />
                    </div>
                    {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 pr-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 pr-3 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="+91 7945******"
                      />
                    </div>
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                {/* Professional Information (for agents/developers) */}
                {(formData.userType === 'agent' || formData.userType === 'developer') && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                          Company Name *
                        </label>
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={handleChange}
                          className={`mt-1 appearance-none block w-full px-3 py-2 border ${formErrors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          placeholder="Real Estate Company"
                        />
                        {formErrors.companyName && <p className="text-red-500 text-xs mt-1">{formErrors.companyName}</p>}
                      </div>
                      <div>
                        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                          License Number
                        </label>
                        <input
                          id="licenseNumber"
                          name="licenseNumber"
                          type="text"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="License #"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                        Years of Experience
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="2-5">2-5 years</option>
                        <option value="6-10">6-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization (Select all that apply)
                      </label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {specializations.map((spec) => (
                          <label key={spec} className="flex items-center">
                            <input
                              type="checkbox"
                              value={spec}
                              checked={formData.specialization.includes(spec)}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{spec}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Information */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Address Information</h3>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Street Address *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 pr-3 py-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Nikol"
                      />
                    </div>
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City *
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        className={`mt-1 appearance-none block w-full px-3 py-2 border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Ahmdabad"
                      />
                      {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State *
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        className={`mt-1 appearance-none block w-full px-3 py-2 border ${formErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Gujarat"
                      />
                      {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country *
                      </label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleChange}
                        className={`mt-1 appearance-none block w-full px-3 py-2 border ${formErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="India"
                      />
                      {formErrors.country && <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>}
                    </div>

                    <div>
                      <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                        ZIP Code *
                      </label>
                      <input
                        id="zip"
                        name="zip"
                        type="text"
                        value={formData.zip}
                        onChange={handleChange}
                        className={`mt-1 appearance-none block w-full px-3 py-2 border ${formErrors.zip ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="39****"
                      />
                      {formErrors.zip && <p className="text-red-500 text-xs mt-1">{formErrors.zip}</p>}
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Security</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className={`appearance-none block w-full pl-10 pr-10 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          placeholder="Create a strong password"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`appearance-none block w-full pl-10 pr-10 py-2 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          placeholder="Confirm your password"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <span className="text-blue-600 hover:text-blue-800 cursor-pointer">Terms of Service</span> and <span className="text-blue-600 hover:text-blue-800 cursor-pointer">Privacy Policy</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit" 
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:scale-105"
                  >
                    <Building className="h-5 w-5 mr-2" />
                    Create Real Estate Account
                  </button>
                </div>
              </div>
            </form> {/* Closed form tag */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;