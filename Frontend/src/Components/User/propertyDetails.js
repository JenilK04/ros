import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import AddPropertyModal from './addProperty';
import ARViewer from './ARviewer';
import ARModelViewer from './ArModelViewer';
import posthog from 'posthog-js';
import ChatPopup from './chatPopup';
import LeafletMap from './leafletmap';
import {
  MapPin, IndianRupeeIcon, Bed, Bath, Ruler,
  Building, Trash2,
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
  const [mapLoading, setMapLoading] = useState(false);
  const [coords, setCoords] = useState(null); 


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

  // Handle keyboard navigation in gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isGalleryOpen) return;
      
      if (e.key === 'ArrowLeft') {
        setGalleryImageIndex(prev => 
          prev === 0 ? property.images.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setGalleryImageIndex(prev => 
          prev === property.images.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === 'Escape') {
        setIsGalleryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, property?.images?.length]);

 
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
      
      // Format the data properly for the server
      const formattedData = {
        ...updatedPropertyData,
        address: {
          street: updatedPropertyData.street,
          city: updatedPropertyData.city,
          state: updatedPropertyData.state,
          zip: updatedPropertyData.zip
        },
        // Ensure images array is properly handled
        images: updatedPropertyData.images,
        // Convert numeric fields
        price: parseFloat(updatedPropertyData.price),
        area: parseFloat(updatedPropertyData.area),
        bedrooms: parseInt(updatedPropertyData.bedrooms),
        bathrooms: parseFloat(updatedPropertyData.bathrooms)
      };

      const response = await API.put(`/properties/${propertyId}`, formattedData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      const updatedProperty = response.data.property || { ...property, ...formattedData };
      
      // Reset image-related states when new images are added
      if (updatedProperty.images?.length !== property?.images?.length) {
        setCurrentImageIndex(0);
        setGalleryImageIndex(0);
      }
      
      setProperty(updatedProperty);
      setIsModalOpen(false);
      
      // Refresh property details to ensure we have the latest data
      await fetchPropertyDetails();
      
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
  }

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
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Properties
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <img
                src={property.images[currentImageIndex] || 'https://via.placeholder.com/600x400'}
                alt={property.title}
                className="object-cover w-full h-full cursor-pointer"
                onClick={() => { setIsGalleryOpen(true); setGalleryImageIndex(currentImageIndex); }}
              />
            </div>
            {property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-w-16 aspect-h-9 rounded-lg overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

        {/* AR Viewer */}

          {/* Property Details Column */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center text-lg text-gray-600 mt-2">
                  <IndianRupeeIcon className="h-5 w-5 mr-1 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {parseFloat(property.price).toLocaleString('en-IN')}
                    {property.listingType === 'For Rent' ? <span className="text-base font-normal ml-1">/month</span> : ''}
                  </span>
                </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Building className="h-5 w-5 mr-2" />
                <span>{property.propertyType} - {property.listingType}</span>
              </div>
              {isResidential && (
                <div className="flex items-center text-gray-600">
                  <Bed className="h-5 w-5 mr-2" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
              )}
              {isResidential && (
                <div className="flex items-center text-gray-600">
                  <Bath className="h-5 w-5 mr-2" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Ruler className="h-5 w-5 mr-2" />
                <span>{property.area} sq ft</span>
              </div>
            </div>

            <div className="flex items-start text-gray-600">
              <MapPin className="h-5 w-5 mr-2 mt-1" />
              <p>
                {property.address?.street}, {property.address?.city},
                <br />
                {property.address?.state} - {property.address?.zip}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-3 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Location Map</h2>
                <p className="text-sm text-gray-600">
                  Showing map based on property address (FREE OpenStreetMap)
                </p>
              </div>

              <div className="p-3">
                {mapLoading && (
                  <p className="text-sm text-gray-600">Loading location on map...</p>
                )}

                {!mapLoading && coords && (
                  <LeafletMap lat={coords.lat} lng={coords.lng} title={property.title} />
                )}

                {!mapLoading && !coords && (
                  <p className="text-sm text-red-500">
                    Location not found for this address.
                  </p>
                )}

                {coords && (
                  <a
                    className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                    href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>


            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Property Details */}
            {/* <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Property Features</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.features && property.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <span className="mr-2">•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div> */}

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                {property.contactName && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-2" />
                    <span>{showFullContactInfo ? property.contactName : getPartialValue(property.contactName)}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2" />
                  {showFullContactInfo ? (
                    <a href={`tel:${property.contactPhone}`} className="text-blue-600 hover:underline">
                      <span>{property.contactPhone}</span>
                    </a>
                  ) : (
                    <span>{getPartialValue(property.contactPhone)}</span>
                  )}
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  {showFullContactInfo ? (
                    <a href={`mailto:${property.contactEmail}`} className="text-blue-600 hover:underline">
                      <span>{property.contactEmail}</span>
                    </a>
                  ) : (
                    <span>{getPartialValue(property.contactEmail)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Property
                  </button>
                  <button
                    onClick={handleDeleteProperty}
                    className="flex-1 bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete Property
                  </button>
                </>
              )}

              {!isOwner && !isAdmin && (
                <button
                  onClick={handleInquiryToggle}
                  className={`flex-1 py-2 px-6 rounded-lg text-white transition-colors ${
                    inquired ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {inquired ? 'Remove from Inquiry' : 'Add to Inquiry'}
                </button>
              )}

              {isAdmin && !isOwner && (
                <button
                  onClick={handleDeleteProperty}
                  className="flex-1 bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 flex items-center space-x-4">
            <span className="text-white text-sm">
              {galleryImageIndex + 1} / {property.images.length}
            </span>
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative w-full h-[75vh] flex items-center justify-center">
            <img
              src={property.images[galleryImageIndex]}
              alt={`Gallery ${galleryImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Prev Button */}
            {property.images.length > 1 && (
              <button
                onClick={() =>
                  setGalleryImageIndex(prev =>
                    prev === 0 ? property.images.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors transform hover:scale-105"
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
                className="absolute right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors transform hover:scale-105"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          <div className="w-full max-w-5xl mt-4 px-4">
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setGalleryImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all transform ${
                    index === galleryImageIndex 
                      ? 'ring-2 ring-blue-500 scale-105' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard Navigation Hint */}
          <div className="absolute bottom-4 left-4 text-white/60 text-sm">
            Use arrow keys for navigation
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
