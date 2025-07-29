import { useState } from 'react';
import { X, MapPin, IndianRupeeIcon, Ruler, Bed, Bath, Home, Building, LandPlot } from 'lucide-react';

const AddPropertyModal = ({ isOpen, onClose, onAddProperty }) => {
  const [formData, setFormData] = useState({
    title: '',
    listingType: 'For Sale',
    propertyType: 'Apartment',
    price: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    images: [],
    imagePreviews: [],
  });
  const [formErrors, setFormErrors] = useState({});

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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];
    const newImages = [];

    files.forEach((file) => {
      newImages.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) { // Once all files are read
          setFormData((prevData) => ({
            ...prevData,
            images: [...prevData.images, ...newImages],
            imagePreviews: [...prevData.imagePreviews, ...newPreviews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    if (formErrors.images) {
      setFormErrors((prevErrors) => ({ ...prevErrors, images: '' }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, index) => index !== indexToRemove),
      imagePreviews: prevData.imagePreviews.filter((_, index) => index !== indexToRemove),
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
    if (!formData.country.trim()) errors.country = 'Country is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    
    // Conditional validation for residential types
    if (['Apartment', 'House', 'Condo'].includes(formData.propertyType)) {
      if (!formData.bedrooms || parseInt(formData.bedrooms) <= 0) errors.bedrooms = 'Bedrooms must be a positive number.';
      if (!formData.bathrooms || parseFloat(formData.bathrooms) <= 0) errors.bathrooms = 'Bathrooms must be a positive number.';
      if (!formData.area || parseFloat(formData.area) <= 0) errors.area = 'Area must be a positive number.';
    }

    if (formData.images.length === 0) errors.images = 'At least one image is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddProperty(formData); // Pass data to parent
      // Reset form
      setFormData({
        title: '', listingType: 'For Sale', propertyType: 'Apartment', price: '',
        street: '', city: '', state: '', zip: '', country: '', description: '',
        bedrooms: '', bathrooms: '', area: '', images: [], imagePreviews: [],
      });
      setFormErrors({}); // Clear errors
      onClose(); // Close modal
    } else {
      console.log('Form validation failed:', formErrors);
    }
  };

  if (!isOpen) return null; // Don't render if not open

  const isResidential = ['Apartment', 'House', 'Condo'].includes(formData.propertyType);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add New Property</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Property Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Luxury Apartment, Commercial Office"
              />
              {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
            </div>

            {/* Listing Type */}
            <div>
              <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">
                Listing Type <span className="text-red-500">*</span>
              </label>
              <select
                id="listingType"
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <IndianRupeeIcon className="h-5 w-5" />
                </span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g., 500000"
                  min="0"
                />
              </div>
              {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
            </div>
          </div>

          {/* Address Section */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" /> Location Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className={`mt-1 block w-full border ${formErrors.street ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., 123 Main Street"
              />
              {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`mt-1 block w-full border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Surat"
              />
              {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`mt-1 block w-full border ${formErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Gujarat"
              />
              {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
            </div>
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className={`mt-1 block w-full border ${formErrors.zip ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., 395007"
              />
              {formErrors.zip && <p className="text-red-500 text-xs mt-1">{formErrors.zip}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`mt-1 block w-full border ${formErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., India"
              />
              {formErrors.country && <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`mt-1 block w-full border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Describe the property, its features, and highlights..."
            ></textarea>
            {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
          </div>

          {/* Conditional Residential Details */}
          {isResidential && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-purple-600" /> Residential Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Bedrooms */}
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Bed className="h-5 w-5" />
                    </span>
                    <input
                      type="number"
                      id="bedrooms"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 border ${formErrors.bedrooms ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="e.g., 3"
                      min="0"
                    />
                  </div>
                  {formErrors.bedrooms && <p className="text-red-500 text-xs mt-1">{formErrors.bedrooms}</p>}
                </div>

                {/* Bathrooms */}
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Bath className="h-5 w-5" />
                    </span>
                    <input
                      type="number"
                      id="bathrooms"
                      name="bathrooms"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 border ${formErrors.bathrooms ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="e.g., 2.5"
                      min="0"
                    />
                  </div>
                  {formErrors.bathrooms && <p className="text-red-500 text-xs mt-1">{formErrors.bathrooms}</p>}
                </div>

                {/* Area */}
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                    Area (Sq. Ft.) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-xs">
                      Sq. Ft.
                    </span>
                    <input
                      type="number"
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className={`block w-full pr-14 pl-3 border ${formErrors.area ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="e.g., 1200"
                      min="0"
                    />
                  </div>
                  {formErrors.area && <p className="text-red-500 text-xs mt-1">{formErrors.area}</p>}
                </div>
              </div>
            </>
          )}

          {/* Image Upload */}
          <div className="mb-6">
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Property Images <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${formErrors.images ? 'border border-red-500 rounded-md' : ''}`}
            />
            {formErrors.images && <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>}

            {/* Image Previews */}
            {formData.imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group rounded-md overflow-hidden shadow-sm border border-gray-200">
                    <img
                      src={preview}
                      alt={`Property Preview ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;