import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../Context/userContext';
import Navbar from './navbar';
import { Mail, Phone, User, MapPin, BadgeCheck, BriefcaseBusiness, Save, X, Edit2, Camera, Trash2 } from 'lucide-react';
import Select from 'react-select';
import API from '../services/api';

const userTypes = [
  { value: 'buyer', label: 'Property Buyer' },
  { value: 'seller', label: 'Property Seller' },
  { value: 'agent', label: 'Real Estate Agent' },
  { value: 'developer', label: 'Property Developer' }
];

const experienceOptions = [
  { value: "0-1", label: "0-1 years" },
  { value: "2-5", label: "2-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "10+", label: "10+ years" },
];

const specializationOptions = [
  { value: 'Residential Properties', label: 'Residential Properties' },
  { value: 'Commercial Properties', label: 'Commercial Properties' },
  { value: 'Industrial Properties', label: 'Industrial Properties' },
  { value: 'Land Development', label: 'Land Development' },
  { value: 'Property Management', label: 'Property Management' },
  { value: 'Investment Properties', label: 'Investment Properties' },
];

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const Profile = () => {
  const { user, loading, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        userType: user.userType || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip: user.zip || '',
        country: user.country || '',
        companyName: user.companyName || '',
        licenseNumber: user.licenseNumber || '',
        experience: user.experience || '',
        specialization: user.specialization || [],
        photo: user.photo || null,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: URL.createObjectURL(file), newPhotoFile: file }));
      setImageError(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null, newPhotoFile: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    let finalData = { ...formData };

    if (formData.newPhotoFile) {
      try {
        finalData.photo = await toBase64(formData.newPhotoFile);
      } catch (error) {
        alert("Failed to upload image.");
        return;
      }
    } else if (formData.photo === null) {
      finalData.photo = null;
    } else {
      finalData.photo = user.photo;
    }

    delete finalData.newPhotoFile;

    try {
      const res = await API.put(`/auth/profile/${user._id}`, finalData);
      updateUser(res.data.user);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      userType: user.userType || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zip: user.zip || '',
      country: user.country || '',
      companyName: user.companyName || '',
      licenseNumber: user.licenseNumber || '',
      experience: user.experience || '',
      specialization: user.specialization || [],
      photo: user.photo || null,
    });
    setIsEditing(false);
  };

  const getSpecializationLabels = (values) => {
    return specializationOptions.filter(option => values.includes(option.value)).map(option => option.label);
  };

  if (loading) return <div className="text-center mt-20">Loading profile...</div>;
  if (!user) return <div className="text-center mt-20 text-red-600">Please log in to view your profile.</div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <User className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            </div>
            {isEditing ? (
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"> 
                  <Save className="h-4 w-4" /> Save
                </button>
                <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"> 
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                <Edit2 className="h-4 w-4" /> Edit
              </button>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-8">
            {/* Profile Photo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {formData.photo && !imageError ? (
                  <img src={formData.photo} alt="Profile" onError={() => setImageError(true)} className="w-32 h-32 rounded-full object-cover border-2 border-blue-200 shadow" />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-2 border-blue-200 shadow">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition rounded-full">
                    <label htmlFor="photo-upload" className="cursor-pointer p-2 bg-white rounded-full">
                      <Camera className="h-5 w-5 text-blue-600" />
                    </label>
                    <input id="photo-upload" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    {formData.photo && (
                      <button onClick={handleRemovePhoto} className="absolute bottom-0 right-0 bg-red-600 p-1 rounded-full text-white hover:bg-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info Sections */}
            <Section title="Basic Info" icon={<BadgeCheck className="text-blue-600 h-5 w-5" />} isEditing={isEditing}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} isEditing={isEditing} />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} isEditing={isEditing} />
                <Input label="Email" name="email" value={formData.email} onChange={handleInputChange} icon={<Mail />} isEditing={isEditing} />
                <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} icon={<Phone />} isEditing={isEditing} />
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">User Type</label>
                    <select name="userType" value={formData.userType} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500">
                      {userTypes.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </Section>

            {/* Address Section */}
            <Section title="Address Info" icon={<MapPin className="text-green-600 h-5 w-5" />} isEditing={isEditing}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Street" name="address" value={formData.address} onChange={handleInputChange} isEditing={isEditing} />
                <Input label="City" name="city" value={formData.city} onChange={handleInputChange} isEditing={isEditing} />
                <Input label="State" name="state" value={formData.state} onChange={handleInputChange} isEditing={isEditing} />
                <Input label="ZIP" name="zip" value={formData.zip} onChange={handleInputChange} isEditing={isEditing} />
                <Input label="Country" name="country" value={formData.country} onChange={handleInputChange} isEditing={isEditing} />
              </div>
            </Section>

            {/* Professional Info */}
            {(formData.userType === 'agent' || formData.userType === 'developer') && (
              <Section title="Professional Info" icon={<BriefcaseBusiness className="text-purple-600 h-5 w-5" />} isEditing={isEditing}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Company" name="companyName" value={formData.companyName} onChange={handleInputChange} isEditing={isEditing} />
                  <Input label="License" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} isEditing={isEditing} />
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Experience</label>
                    {isEditing ? (
                      <select name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500">
                        {experienceOptions.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>
                    ) : <p>{formData.experience}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Specialization</label>
                    {isEditing ? (
                      <Select
                        isMulti
                        options={specializationOptions}
                        value={specializationOptions.filter(opt => formData.specialization.includes(opt.value))}
                        onChange={selected => setFormData(prev => ({ ...prev, specialization: selected.map(s => s.value) }))}
                      />
                    ) : <p>{getSpecializationLabels(formData.specialization).join(', ')}</p>}
                  </div>
                </div>
              </Section>
            )}

          </div>
        </div>
      </main>
    </>
  );
};

// Helper Components
const Section = ({ title, icon, children }) => (
  <div className="mb-6">
    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">{icon} {title}</h3>
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">{children}</div>
  </div>
);

const Input = ({ label, name, value, onChange, icon, isEditing }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    {isEditing ? (
      <div className="relative">
        {icon && <span className="absolute left-3 top-2">{icon}</span>}
        <input
          name={name}
          value={value || ''}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 ${icon ? 'pl-10' : ''}`}
        />
      </div>
    ) : (
      <p className="text-gray-800">{value || '-'}</p>
    )}
  </div>
);

export default Profile;
