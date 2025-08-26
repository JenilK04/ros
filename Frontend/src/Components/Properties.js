import React, { useState, useEffect } from 'react'; // Import useEffect
import Navbar from './navbar';
import PropertyCard from './propertyCard';
import AddPropertyModal from './addProperty'; // Ensure this path is correct
import { Plus } from 'lucide-react';
import API from '../services/api'; 
import { useUser } from '../Context/userContext'
// Remove initialSampleProperties as we will fetch from the backend
// const initialSampleProperties = [ ... ];

const Properties = () => { // Get user info from context
  const { user } = useUser(); // Get logged-in user info from context
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [properties, setProperties] = useState([]); // Initialize as empty array, data will come from API
  const [loading, setLoading] = useState(true);   // State for loading indicator
  const [error, setError] = useState(null); 

  // Function to fetch properties from the backend
  const fetchProperties = async () => {
    setLoading(true); // Set loading to true before fetching
    setError(null);   // Clear any previous errors
    try {
      const response = await API.get(`/properties`);
      setProperties(response.data); // Axios puts the response data in .data
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      // More robust error message for the user
      setError(err.response?.data?.msg || 'Failed to load properties. Please try again later.');
    } finally {
      setLoading(false); // Set loading to false after fetch completes (success or error)
    }
  };

  // Use useEffect to fetch properties when the component mounts
  useEffect(() => {
    fetchProperties();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle adding a new property via API
  const handleAddProperty = async (newPropertyData) => {
    // newPropertyData contains all form fields, including Base64 images
    try {
      const response = await API.post(`/properties`, newPropertyData);
      // Axios automatically sets Content-Type to application/json and stringifies the body
      // for JSON payloads, including your Base64 images.

      console.log('Property added successfully:', response.data);
      alert('Property added successfully!');
      setIsModalOpen(false); // Close modal on success
      fetchProperties(); // Re-fetch all properties to update the list with the new one
    } catch (err) {
      console.error('Error adding property:', err);
      // Provide user-friendly error messages from the backend or a generic one
      alert(`Failed to add property: ${err.response?.data?.msg || err.message || 'Unknown error occurred.'}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8">
          <h1 className="text-3xl text-gray-800 font-extrabold mb-8 text-center">Available Properties</h1>

          {/* Loading, Error, and No Properties messages */}
          {loading && <p className="text-center text-gray-600">Loading properties...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
          {!loading && !error && properties.length === 0 && (
            <p className="text-center text-gray-600">No properties available. Add one!</p>
          )}

          {/* Properties Grid - Only render if not loading and no error, and properties exist */}
          {!loading && !error && properties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id} // Use property._id from MongoDB as the key
                  property={{
                    id: property._id, // Pass _id as id for consistency if PropertyCard uses it
                    title: property.title,
                    // Combine address components for display, assuming your backend sends address as a nested object
                    location: `${property.address.city}, ${property.address.state}`,
                    // Format price with currency symbol and locale string
                    price: `₹${parseFloat(property.price).toLocaleString('en-IN')}`, // Using Indian Rupee symbol
                    // For Base64 images, the image property directly holds the Base64 string
                    image: property.images.length > 0 ? property.images[0] : 'https://via.placeholder.com/600x400/CCCCCC/FFFFFF?text=No+Image',
                    // Pass contact details to PropertyCard
                    contactName: property.contactName,
                    contactPhone: property.contactPhone,
                  }}
                />
              ))}
            </div>
          )}

          {/* Fixed Plus Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsModalOpen(true)} // This is correctly opening the modal
              className="flex items-center justify-center rounded-full h-14 w-14 text-white shadow-xl
                         bg-gradient-to-br from-blue-600 to-indigo-800
                         hover:from-blue-700 hover:to-indigo-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Add New Property"
            >
              <Plus className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Property Modal Dialog (rendered conditionally) */}
      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProperty={handleAddProperty}
        loggedInUser={{ name: `${user.firstName} ${user.lastName}`, phone: user?.phone }}
      />
    </>
  );
};

export default Properties;