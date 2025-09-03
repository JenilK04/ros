import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
// Navbar is no longer needed here if you are using the Layout component
import AddPropertyModal from './addProperty';
import {
  MapPin, IndianRupeeIcon, Bed, Bath, Ruler,
  Building, Home, LandPlot, Trash2, // <-- Added Trash2 icon
  ArrowLeft, ArrowRight, User, Phone,
  Mail
} from 'lucide-react';
import { useUser } from '../../Context/userContext';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  // ... (rest of your state variables are the same)
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquired, setInquired] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // ... (fetchPropertyDetails, handleInquiryToggle, handleUpdateProperty functions are the same)
  const fetchPropertyDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedProperty = response.data.property || response.data;
      setProperty(fetchedProperty);

      if (fetchedProperty.inquiredBy?.includes(user?._id)) {
        setInquired(true);
      } else {
        setInquired(false);
      }
    } catch (err) {
      console.error('Failed to fetch property details:', err);
      setError(err.response?.data?.msg || 'Failed to load property details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPropertyDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?._id]);

  const handleInquiryToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!inquired) {
        const response = await API.post(`/properties/${id}/inquiry`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperty(response.data.property || property);
        setInquired(true);
      } else {
        const response = await API.delete(`/properties/${id}/inquiry`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperty(response.data.property || property);
        setInquired(false);
      }
    } catch (err) {
      console.error("Inquiry action failed:", err);
      alert(err.response?.data?.msg || "Failed to update inquiry.");
    }
  };

  const handleUpdateProperty = async (propertyId, updatedPropertyData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.put(`/properties/${propertyId}`, updatedPropertyData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProperty(response.data.property || { ...property, ...updatedPropertyData });
      setIsModalOpen(false);
      alert('Property updated successfully!');
    } catch (err) {
      console.error('Error updating property:', err);
      alert(err.response?.data?.msg || err.message);
    }
  };

  // ✅ NEW: Function for admin to delete a property
  const handleDeleteProperty = async () => {
    if (window.confirm('Are you sure you want to delete this property permanently? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await API.delete(`/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Property deleted successfully!');
        navigate('/properties'); // Redirect to properties list after deletion
      } catch (err) {
        console.error('Failed to delete property:', err);
        alert(err.response?.data?.msg || 'Failed to delete property.');
      }
    }
  };


  // ... (getPropertyTypeIcon is the same)
  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'Apartment': return <Building className="h-5 w-5 text-gray-600" />;
      case 'House': return <Home className="h-5 w-5 text-gray-600" />;
      case 'Condo': return <Building className="h-5 w-5 text-gray-600" />;
      case 'Land': return <LandPlot className="h-5 w-5 text-gray-600" />;
      default: return null;
    }
  };

  const isOwner = property?.userId === user?._id;
  const isAdmin = user?.role === 'admin'; // <-- Added admin check for convenience
  const isResidential = ['Apartment', 'House', 'Condo'].includes(property?.propertyType);

  if (loading) return (
    // Note: No <Navbar /> needed if using Layout component
    <div className="min-h-screen flex items-center justify-center text-white text-lg">
        Loading property details...
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-400 text-lg">
      {error}
    </div>
  );

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center text-white text-lg">
      Property not found.
    </div>
  );

  return (
    // The Layout component provides the background, so we remove styling here
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 via-white to-green-100">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-200/50">

        {/* ... (Image Carousel is the same) ... */}
        <div className="relative h-96 bg-gray-200">
            {property.images?.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]}
                  alt={`${property.title} ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev === 0 ? property.images.length - 1 : prev - 1))}
                      className="absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75"
                    >
                      <ArrowLeft />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev === property.images.length - 1 ? 0 : prev + 1))}
                      className="absolute top-1/2 right-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75"
                    >
                      <ArrowRight />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                No Image Available
              </div>
            )}
          </div>

        <div className="p-8">
          {/* ... (Title, Price, Address, Description, etc. are the same) ... */}
          <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900">{property.title}</h1>
              <div className="flex items-center text-green-700 font-bold text-3xl">
                <IndianRupeeIcon className="h-7 w-7 mr-1" />
                {parseFloat(property.price).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="flex items-center text-gray-600 text-lg mb-4">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              <p>{property.address?.street}, {property.address?.city}, {property.address?.state} - {property.address?.zip}</p>
            </div>
            <div className="flex items-center text-gray-600 text-base mb-6">
              {getPropertyTypeIcon(property.propertyType)}
              <p className="ml-2">{property.propertyType} - {property.listingType}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>
            {isResidential && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Residential Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-700">
                    <Bed className="h-5 w-5 mr-2 text-red-500" />
                    <span>Bedrooms: <span className="font-medium">{property.bedrooms}</span></span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Bath className="h-5 w-5 mr-2 text-teal-500" />
                    <span>Bathrooms: <span className="font-medium">{property.bathrooms}</span></span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Ruler className="h-5 w-5 mr-2 text-purple-500" />
                    <span>Area: <span className="font-medium">{property.area} Sq. Ft.</span></span>
                  </div>
                </div>
              </div>
            )}

          {/* ✅ UPDATED: Contact Info now visible to admin */}
          {(inquired || isAdmin || isOwner) && property.contactName && property.contactPhone && property.contactEmail && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Contact Information</h2>
              <div className="flex items-center text-gray-700 mb-1">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                <span>{property.contactName}</span>
              </div>
              <div className="flex items-center text-gray-700 mb-1">
                <Phone className="h-5 w-5 mr-2 text-gray-500" />
                <a href={`tel:${property.contactPhone}`} className="hover:underline text-blue-600">{property.contactPhone}</a>
              </div>
              <div className="flex items-center text-gray-700 mb-1">
                <Mail className="h-5 w-5 mr-2 text-gray-500" />
                <a href={`mailto:${property.contactEmail}`} className="hover:underline text-blue-600">{property.contactEmail}</a>
              </div>
            </div>
          )}

          {/* ✅ UPDATED: Action Buttons with Admin Delete */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={() => navigate('/properties')}
              className="w-full sm:w-auto flex-grow bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Back to Properties
            </button>

            {isOwner ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto flex-grow bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition"
              >
                Edit Property
              </button>
            ) : !isAdmin && ( // Hide inquiry button for admin
              <button
                onClick={handleInquiryToggle}
                className={`w-full sm:w-auto flex-grow py-2 rounded-md text-white transition duration-200
                  ${inquired ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {inquired ? 'Remove from Inquiry' : 'Add to Inquiry'}
              </button>
            )}

            {/* ✅ NEW: Admin Delete Button */}
            {isAdmin && (
              <button
                onClick={handleDeleteProperty}
                className="w-full sm:w-auto flex-grow bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Delete Property
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* ... (Modal is the same) ... */}
      {isOwner && property && (
        <AddPropertyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editProperty={property}
          onUpdateProperty={handleUpdateProperty}
          loggedInUser={{ name: `${user?.firstName || ''} ${user?.lastName || ''}`, phone: user?.phone || '', email: user?.email || '' }}
        />
      )}
    </div>
  );
};

export default PropertyDetails;