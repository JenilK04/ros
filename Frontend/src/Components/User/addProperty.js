import React, { useState, useEffect } from 'react';
import { X, MapPin, IndianRupeeIcon, Ruler, Home, Building, LandPlot, Phone, Image as ImageIcon } from 'lucide-react';

const AddPropertyModal = ({
  isOpen,
  onClose,
  onAddProperty,
  onUpdateProperty,
  loggedInUser,
  editProperty,
}) => {
  const initialFormData = {
    title: '',
    listingType: 'For Sale',
    propertyType: 'Apartment',
    price: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    images: [],
    imagePreviews: [],
    contactName: loggedInUser?.name || '',
    contactPhone: loggedInUser?.phone || '',
    contactEmail: loggedInUser?.email || ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // ✅ new loading state

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      title: editProperty?.title || '',
      listingType: editProperty?.listingType || 'For Sale',
      propertyType: editProperty?.propertyType || 'Apartment',
      price: editProperty?.price || '',
      street: editProperty?.address?.street || '',
      city: editProperty?.address?.city || '',
      state: editProperty?.address?.state || '',
      zip: editProperty?.address?.zip || '',
      description: editProperty?.description || '',
      bedrooms: editProperty?.bedrooms || '',
      bathrooms: editProperty?.bathrooms || '',
      area: editProperty?.area || '',
      images: editProperty?.images || [],
      imagePreviews: editProperty?.images || [],
      contactName: editProperty?.contactName || loggedInUser?.name || '',
      contactPhone: editProperty?.contactPhone || loggedInUser?.phone || '',
      contactEmail: editProperty?.contactEmail || loggedInUser?.email || ''
    });

    setFormErrors({});
    setIsLoading(false);
  }, [isOpen, editProperty, loggedInUser]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while submitting
    setFormData(initialFormData);
    setFormErrors({});
    onClose();
  };

  const propertyTypes = [
    { value: 'Apartment', label: 'Apartment', icon: <Building className="h-4 w-4" /> },
    { value: 'House', label: 'House', icon: <Home className="h-4 w-4" /> },
    { value: 'Condo', label: 'Condo', icon: <Building className="h-4 w-4" /> },
    { value: 'Office', label: 'Office', icon: <Building className="h-4 w-4" /> },
    { value: 'Shop', label: 'Shop', icon: <Building className="h-4 w-4" /> },
    { value: 'Land', label: 'Land', icon: <LandPlot className="h-4 w-4" /> },
    { value: 'Warehouse', label: 'Warehouse', icon: <Building className="h-4 w-4" /> },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newPreviews],
            imagePreviews: [...prev.imagePreviews, ...newPreviews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    if (formErrors.images) setFormErrors((prev) => ({ ...prev, images: '' }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Property Title is required.';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Price is required and must be positive.';
    if (!formData.street.trim()) errors.street = 'Street address is required.';
    if (!formData.city.trim()) errors.city = 'City is required.';
    if (!formData.state.trim()) errors.state = 'State is required.';
    if (!formData.zip.trim()) errors.zip = 'ZIP code is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.contactName.trim()) errors.contactName = 'Contact Name is required.';
    if (!formData.contactPhone.trim()) errors.contactPhone = 'Contact Phone is required.';
    if (formData.contactPhone.trim() && !/^\d{10,15}$/.test(formData.contactPhone.trim())) {
      errors.contactPhone = 'Please enter a valid phone number (10-15 digits).';
    if (!formData.contactEmail.trim()) errors.contactEmail = 'Contact Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) errors.contactEmail = 'Invalid email address.';
    }

    if (['Apartment', 'House', 'Condo'].includes(formData.propertyType)) {
      if (!formData.bedrooms || parseInt(formData.bedrooms) <= 0) errors.bedrooms = 'Bedrooms must be a positive number.';
      if (!formData.bathrooms || parseFloat(formData.bathrooms) <= 0) errors.bathrooms = 'Bathrooms must be a positive number.';
      if (!formData.area || parseFloat(formData.area) <= 0) errors.area = 'Area must be a positive number.';
    }

    if (formData.images.length === 0) errors.images = 'At least one image is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editProperty?._id) {
        await onUpdateProperty(editProperty._id, formData);
      } else {
        await onAddProperty(formData);
      }
      handleClose();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const isResidential = ['Apartment', 'House', 'Condo'].includes(formData.propertyType);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300 ease-in-out relative">

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-3xl">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-20 w-20 animate-spin"></div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            {editProperty ? 'Edit Property' : 'Add New Property'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* General Details Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Home className="h-6 w-6 text-indigo-500" /> Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Title */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                  placeholder="e.g., Spacious 3BHK Apartment in Downtown"
                />
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
              </div>

              {/* Listing Type */}
              <div>
                <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Type
                </label>
                <select
                  id="listingType"
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <IndianRupeeIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full pl-10 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    placeholder="e.g., 5000000"
                    min="0"
                  />
                </div>
                {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-500" /> Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address Fields */}
              {['street','city','state','zip'].map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${formErrors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  />
                  {formErrors[field] && <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Ruler className="h-6 w-6 text-green-500" /> Description & Features
            </h3>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`mt-1 block w-full border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-colors`}
                placeholder="Describe your property in detail, including key features and nearby amenities."
              ></textarea>
              {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
            </div>

            {/* Residential Details */}
            {isResidential && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['bedrooms','bathrooms','area'].map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.charAt(0).toUpperCase()+field.slice(1)}
                    </label>
                    <input
                      type="number"
                      id={field}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${formErrors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors`}
                      min="0"
                    />
                    {formErrors[field] && <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Phone className="h-6 w-6 text-purple-500" /> Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['contactName','contactPhone','contactEmail'].map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                    {field === 'contactName' ? 'Contact Name' : field === 'contactPhone' ? 'Contact Phone' : 'Contact Email'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={field==='contactPhone'?'tel': field==='contactEmail'?'email':'text'}
                    id={field}  
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${formErrors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
                  />
                  {formErrors[field] && <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-red-500" /> Property Images
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images <span className="text-red-500">*</span></label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500 text-sm">Drag & drop or click to upload images</p>
                </div>
              </div>
              {formErrors.images && <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>}
            </div>

            {formData.imagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-600 mb-2">Image Previews</h4>
                <div className="flex gap-4 flex-wrap">
                  {formData.imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-32 h-32 rounded-lg shadow-md overflow-hidden group">
                      <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
                      <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2.5 text-gray-700 rounded-full font-semibold border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full font-bold shadow-lg hover:from-indigo-600 hover:to-blue-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : editProperty ? 'Update Property' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          .loader {
            border-top-color: #6366f1;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
};

export default AddPropertyModal;
