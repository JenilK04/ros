// src/components/PropertyDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ clean import
import API from '../services/api';
import Navbar from './navbar';
import {
  MapPin, IndianRupeeIcon, Bed, Bath, Ruler,
  Phone, User, Building, Home, LandPlot,
  ArrowLeft, ArrowRight
} from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get(`/properties/${id}`);
        setProperty(response.data);
      } catch (err) {
        console.error('Failed to fetch property details:', err);
        setError(err.response?.data?.msg || 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-700 text-lg">Loading property details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-700 text-lg">Property not found.</p>
        </div>
      </>
    );
  }

  const isResidential = ['Apartment', 'House', 'Condo'].includes(property.propertyType);

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'Apartment': return <Building className="h-5 w-5 text-gray-600" />;
      case 'House': return <Home className="h-5 w-5 text-gray-600" />;
      case 'Condo': return <Building className="h-5 w-5 text-gray-600" />;
      case 'Office': return <Building className="h-5 w-5 text-gray-600" />;
      case 'Shop': return <Building className="h-5 w-5 text-gray-600" />;
      case 'Land': return <LandPlot className="h-5 w-5 text-gray-600" />;
      case 'Warehouse': return <Building className="h-5 w-5 text-gray-600" />;
      default: return null;
    }
  };

  // ✅ Simple inquiry handler (can be replaced with API call or Context)
  const handleAddToInquiry = () => {
    alert("Property added to inquiry!");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Image Carousel */}
          <div className="relative h-96 bg-gray-200">
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]}
                  alt={`${property.title}  ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
                      className="absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75"
                    >
                      <ArrowLeft />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
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
            {/* Title and Price */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900">{property.title}</h1>
              <div className="flex items-center text-green-700 font-bold text-3xl">
                <IndianRupeeIcon className="h-7 w-7 mr-1" />
                {parseFloat(property.price).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex items-center text-gray-600 text-lg mb-4">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              <p>{property.address.street}, {property.address.city}, {property.address.state} - {property.address.zip}, {property.address.country}</p>
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

            {/* Contact Details */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <User className="h-5 w-5 mr-2 text-orange-500" />
                  <span>{property.contactName}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="h-5 w-5 mr-2 text-green-500" />
                  <a href={`tel:${property.contactPhone}`} className="text-blue-600 hover:underline">
                    {property.contactPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* ✅ Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => navigate('/properties')}
                className="w-full sm:w-1/2 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Back to Properties
              </button>
              <button
                onClick={handleAddToInquiry}
                className="w-full sm:w-1/2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
              >
                Add to Inquiry
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyDetails;
