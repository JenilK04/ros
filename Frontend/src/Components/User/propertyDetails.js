import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import AddPropertyModal from './addProperty';
import ARViewer from './ARviewer';
import ARModelViewer from './ArModelViewer';
import posthog from 'posthog-js';
import ChatPopup from './chatPopup';
import {
  MapPin, IndianRupeeIcon, Bed, Bath, Ruler,
  Building, Home, LandPlot, Trash2,
  ArrowLeft, ArrowRight, User, Phone,
  Mail,MessageCircle
} from 'lucide-react';
import { useUser } from '../../Context/userContext';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquired, setInquired] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showARViewer, setShowARViewer] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);


  // Fullscreen Gallery
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);

  // Fetch property by ID
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

useEffect(() => {
    if (id) {
      posthog.capture("property_view", {
        propertyId: id,
        $current_url: window.location.pathname,
      });
    }
  }, [id]);


  const handleInquiryToggle = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!inquired) {
                await API.post(`/properties/${id}/inquiry`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setInquired(true);
            } else {
                await API.delete(`/properties/${id}/inquiry`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setInquired(false);
            }

            // ✨ 2. Call refreshUser after the API request succeeds
            // This is the crucial change that updates the global user state.
            if (refreshUser) {
                await refreshUser();
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
    if (window.confirm('Are you sure you want to delete this property permanently?')) {
      try {
        const token = localStorage.getItem('token');
        await API.delete(`/properties/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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

  const getPartialValue = (value) => {
    if (!value) return '';
    const atIndex = value.indexOf('@');
    if (atIndex > 0) {
      const localPart = value.substring(0, atIndex);
      const domain = value.substring(atIndex);
      return `${localPart.substring(0, Math.floor(localPart.length / 3))}***${domain}`;
    }
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
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-200/50">

        {/* Image Carousel */}
        <div
          className="relative h-64 sm:h-80 md:h-96 bg-gray-200 cursor-pointer"
          onClick={() => { setIsGalleryOpen(true); setGalleryImageIndex(currentImageIndex); }}
        >
          {property.images?.length > 0 ? (
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.title} ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 ">
              No Image Available
            </div>
          )}
          {/* Posted Date Badge */}
          {property.createdAt && (
            <span className="absolute top-2 right-2 bg-white bg-opacity-70 text-grey-900 text-xs px-2 py-1 rounded">
              {new Date(property.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {property.images?.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1); }}
                className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1); }}
                className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>

        {/* AR Viewer */}

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Title & Price */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 break-words">{property.title}</h1>
            <div className="flex items-center text-green-700 font-bold text-xl md:text-2xl bg-green-100 px-3 py-1 rounded-lg shadow-sm">
              <IndianRupeeIcon className="h-5 w-5 md:h-6 md:w-6 mr-1" />
              {parseFloat(property.price).toLocaleString('en-IN')}
              {property.listingType === 'For Rent' ? <span className="text-base font-normal ml-1">/month</span> : ''}
            </div>
          </div>
          {property._id && (
            <div className="mb-4">
              <ARViewer propertyId={property._id} />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <button
              onClick={() => setShowARViewer(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow w-full sm:w-auto"
            >
              View 3D Model
            </button>
          </div>
          {/* AR/3D Viewer Modal */}
          {showARViewer && (
            <ARModelViewer
              onClose={() => setShowARViewer(false)}
            />
          )}
          {/* Address */}
          <div className="flex items-start text-gray-600 text-base sm:text-lg mb-4">
            <MapPin className="h-5 w-5 mr-2 text-blue-500 shrink-0" />
            <p className="break-words">{property.address?.street}, {property.address?.city}, {property.address?.state} - {property.address?.zip}</p>
          </div>

          {/* Type */}
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

            {isOwner && (
              <>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto flex-grow bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition"
                >
                  Edit Property
                </button>
                <button
                  onClick={handleDeleteProperty}
                  className="w-full sm:w-auto flex-grow bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete Property
                </button>
              </>
            )}

            {!isOwner && !isAdmin && (
              <button
                onClick={handleInquiryToggle}
                className={`w-full sm:w-auto flex-grow py-2 rounded-md text-white transition duration-200
                  ${inquired ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {inquired ? 'Remove from Inquiry' : 'Add to Inquiry'}
              </button>
            )}

            {isAdmin && !isOwner && (
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

      {/* Add/Edit Modal */}
      {isOwner && property && (
        <AddPropertyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editProperty={property}
          onUpdateProperty={handleUpdateProperty}
          loggedInUser={{ name: `${user?.firstName || ''} ${user?.lastName || ''}`, phone: user?.phone || '', email: user?.email || '' }}
        />
      )}

      {/* Fullscreen Image Gallery */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center">
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-4 right-4 text-white text-4xl font-bold z-50"
          >
            &times;
          </button>

          <div className="relative max-w-5xl max-h-[90vh] flex items-center justify-center">
            <img
              src={property.images[galleryImageIndex]}
              alt={`Gallery ${galleryImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {/* Prev Button */}
            {property.images.length > 1 && (
              <button
                onClick={() =>
                  setGalleryImageIndex(prev =>
                    prev === 0 ? property.images.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 text-white text-3xl p-2 bg-black bg-opacity-30 rounded-full hover:bg-opacity-50"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {property.images.length > 1 && (
              <button
                onClick={() =>
                  setGalleryImageIndex(prev =>
                    prev === property.images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 text-white text-3xl p-2 bg-black bg-opacity-30 rounded-full hover:bg-opacity-50"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}
      {/* Floating Chat Button */}
      {!isOwner && !isAdmin && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110 z-50"
          title="Chat with Seller"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isChatOpen && (
      <ChatPopup
        property={property}
        sellerId={property.userId}
        buyerId={user._id}
        onClose={() => setIsChatOpen(false)}
        note="You can also see chat in Dashboard -> MyLeads"
      />
      )}
    </div>
  );
};

export default PropertyDetails;
