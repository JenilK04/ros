import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from './navbar';
import AddPropertyModal from './addProperty';
import {
  MapPin, IndianRupeeIcon, Bed, Bath, Ruler,
  Building, Home, LandPlot,
  ArrowLeft, ArrowRight, User, Phone
} from 'lucide-react';
import { useUser } from '../Context/userContext';

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

  // Fetch property details
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

      // mark inquired if user's ID exists in inquiredBy
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
  }, [id, user?._id]);

  // Inquiry toggle
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

  // Update property after editing
  const handleUpdateProperty = async (propertyId, updatedPropertyData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.put(`/properties/${propertyId}`, updatedPropertyData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update state with returned property or merge changes
      setProperty(response.data.property || { ...property, ...updatedPropertyData });
      setIsModalOpen(false);
      alert('Property updated successfully!');
    } catch (err) {
      console.error('Error updating property:', err);
      alert(err.response?.data?.msg || err.message);
    }
  };

  const isOwner = property?.userId === user?._id;
  const isResidential = ['Apartment', 'House', 'Condo'].includes(property?.propertyType);

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'Apartment': return <Building className="h-5 w-5 text-gray-600" />;
      case 'House': return <Home className="h-5 w-5 text-gray-600" />;
      case 'Condo': return <Building className="h-5 w-5 text-gray-600" />;
      case 'Land': return <LandPlot className="h-5 w-5 text-gray-600" />;
      default: return null;
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading property details...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    </>
  );

  if (!property) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-lg">Property not found.</p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">

          {/* Image Carousel */}
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
            {/* Title & Price */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900">{property.title}</h1>
              <div className="flex items-center text-green-700 font-bold text-3xl">
                <IndianRupeeIcon className="h-7 w-7 mr-1" />
                {parseFloat(property.price).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center text-gray-600 text-lg mb-4">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              <p>{property.address?.street}, {property.address?.city}, {property.address?.state} - {property.address?.zip}</p>
            </div>

            <div className="flex items-center text-gray-600 text-base mb-6">
              {getPropertyTypeIcon(property.propertyType)}
              <p className="ml-2">{property.propertyType} - {property.listingType}</p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Residential Details */}
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

            {/* Contact Info */}
            {inquired && property.contactName && property.contactPhone && (
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
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => navigate('/properties')}
                className="w-full sm:w-1/2 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Back to Properties
              </button>

              {isOwner ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-1/2 bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition"
                >
                  Edit Property
                </button>
              ) : (
                <button
                  onClick={handleInquiryToggle}
                  className={`w-full sm:w-1/2 py-2 rounded-md text-white transition duration-200
                    ${inquired ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {inquired ? 'Remove from Inquiry' : 'Add to Inquiry'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Edit Property Modal */}
      {isOwner && property && (
        <AddPropertyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editProperty={property}
          onUpdateProperty={handleUpdateProperty}
          loggedInUser={{ name: `${user?.firstName || ''} ${user?.lastName || ''}`, phone: user?.phone || '' }}
        />
      )}
    </>
  );
};

export default PropertyDetails;
