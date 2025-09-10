import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import AddPropertyModal from './addProperty';
import {
  MapPin, IndianRupeeIcon, Bed, Bath, Ruler,
  Building, Home, LandPlot, Trash2,
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
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquired, setInquired] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDeleteProperty = async () => {
    if (window.confirm('Are you sure you want to delete this property permanently? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await API.delete(`/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Property deleted successfully!');
        navigate('/properties');
      } catch (err) {
        console.error('Failed to delete property:', err);
        alert(err.response?.data?.msg || 'Failed to delete property.');
      }
    }
  };

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'Apartment': return <Building className="h-5 w-5 text-gray-600" />;
      case 'House': return <Home className="h-5 w-5 text-gray-600" />;
      case 'Condo': return <Building className="h-5 w-5 text-gray-600" />;
      case 'Land': return <LandPlot className="h-5 w-5 text-gray-600" />;
      default: return null;
    }
  };

  // Helper function to show partial info
  const getPartialValue = (value) => {
    if (!value) return '';
    const atIndex = value.indexOf('@');
    if (atIndex > 0) {
      // It's an email
      const localPart = value.substring(0, atIndex);
      const domain = value.substring(atIndex);
      return `${localPart.substring(0, Math.floor(localPart.length / 3))}***${domain}`;
    }
    // It's a phone number
    return `${value.substring(0, 4)}*******${value.substring(value.length - 2)}`;
  };

  const isOwner = property?.userId === user?._id;
  const isAdmin = user?.role === 'admin';
  const isResidential = ['Apartment', 'House', 'Condo'].includes(property?.propertyType);
  const showFullContactInfo = inquired || isAdmin || isOwner;

  if (loading) return (
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
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 via-white to-green-100">
      <div className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 via-white to-green-100">
  <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-200/50">
    
    {/* Image Carousel */}
    <div className="relative h-64 sm:h-80 md:h-96 bg-gray-200">
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
                className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(prev => (prev === property.images.length - 1 ? 0 : prev + 1))}
                className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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

    {/* Content */}
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{property.title}</h1>
        <div className="flex items-center text-green-700 font-bold text-2xl md:text-3xl">
          <IndianRupeeIcon className="h-6 w-6 md:h-7 md:w-7 mr-1" />
          {parseFloat(property.price).toLocaleString('en-IN')}
          {property.listingType === 'For Rent' ? '/month' : ''}
        </div>
      </div>

      <div className="flex items-start text-gray-600 text-base sm:text-lg mb-4">
        <MapPin className="h-5 w-5 mr-2 text-blue-500 shrink-0" />
        <p className="break-words">{property.address?.street}, {property.address?.city}, {property.address?.state} - {property.address?.zip}</p>
      </div>

      <div className="flex items-center text-gray-600 text-sm sm:text-base mb-6">
        {getPropertyTypeIcon(property.propertyType)}
        <p className="ml-2">{property.propertyType} - {property.listingType}</p>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{property.description}</p>
      </div>

      {/* Property Details */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Property Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isResidential && (
            <>
              <div className="flex items-center text-gray-700">
                <Bed className="h-5 w-5 mr-2 text-red-500" />
                <span>Bedrooms: <span className="font-medium">{property.bedrooms}</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <Bath className="h-5 w-5 mr-2 text-teal-500" />
                <span>Bathrooms: <span className="font-medium">{property.bathrooms}</span></span>
              </div>
            </>
          )}
          <div className="flex items-center text-gray-700">
            <Ruler className="h-5 w-5 mr-2 text-purple-500" />
            <span>Area: <span className="font-medium">{property.area} Sq. Ft</span></span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      {(property.contactName || property.contactPhone || property.contactEmail) && (
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Contact Information</h2>
          {property.contactName && (
            <div className="flex items-center text-gray-700 mb-1">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <span>{property.contactName}</span>
            </div>
          )}
          <div className="flex items-center text-gray-700 mb-1">
            <Phone className="h-5 w-5 mr-2 text-gray-500" />
            {showFullContactInfo ? (
              <a href={`tel:${property.contactPhone}`} className="hover:underline text-blue-600">{property.contactPhone}</a>
            ) : (
              <span>{getPartialValue(property.contactPhone)}</span>
            )}
          </div>
          <div className="flex items-center text-gray-700 mb-1">
            <Mail className="h-5 w-5 mr-2 text-gray-500" />
            {showFullContactInfo ? (
              <a href={`mailto:${property.contactEmail}`} className="hover:underline text-blue-600">{property.contactEmail}</a>
            ) : (
              <span>{getPartialValue(property.contactEmail)}</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
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
        ) : !isAdmin && (
          <button
            onClick={handleInquiryToggle}
            className={`w-full sm:w-auto flex-grow py-2 rounded-md text-white transition duration-200
              ${inquired ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {inquired ? 'Remove from Inquiry' : 'Add to Inquiry'}
          </button>
        )}

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
</div>

      
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