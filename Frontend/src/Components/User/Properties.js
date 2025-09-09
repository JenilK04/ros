// src/components/Properties.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import PropertyCard from './propertyCard';
import AddPropertyModal from './addProperty';
import { Plus } from 'lucide-react';
import API from '../../services/api';
import { useUser } from '../../Context/userContext';
import PropertySearchBar from './propertySearchbar';

const Properties = () => {
  const { user } = useUser(); 

  const [filters, setFilters] = useState({
    location: "",
    listingType: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch properties from backend
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/properties');
      setProperties(response.data || []);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError(err.response?.data?.msg || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // ✅ Filter logic
  const applyFilters = (property) => {
  const address = property.address || {};

  const matchesLocation =
    !filters.location ||
    ['street', 'city', 'state'].some((field) =>
      address[field]?.toLowerCase().includes(filters.location.toLowerCase())
    );

    return (
      matchesLocation &&
      (!filters.listingType || property.listingType === filters.listingType) &&
      (!filters.propertyType || property.propertyType === filters.propertyType) &&
      (!filters.minPrice || property.price >= parseInt(filters.minPrice)) &&
      (!filters.maxPrice || property.price <= parseInt(filters.maxPrice))
    );
  };

  // ✅ Add property
  const handleAddProperty = async (newPropertyData) => {
    try {
      const token = localStorage.getItem('token');
      await API.post('/properties', newPropertyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Property added successfully!');
      setIsModalOpen(false);
      fetchProperties();
    } catch (err) {
      console.error('Error adding property:', err);
      alert(`Failed to add property: ${err.response?.data?.msg || err.message}`);
    }
  };

  // ✅ Update property
  const handleUpdateProperty = async (id, updatedPropertyData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await API.put(`/properties/${id}`, updatedPropertyData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updatedProperty = response.data; // ✅ get full updated property from backend

    setProperties((prev) =>
      prev.map((prop) => (prop._id === id ? updatedProperty : prop))
    );

    setIsModalOpen(false);
    setEditProperty(null);
    alert('Property updated successfully!');
  } catch (err) {
    console.error('Error updating property:', err);
    alert(`Failed to update property: ${err.response?.data?.msg || err.message}`);
  }
};


  // ✅ Delete property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Property deleted successfully!');
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert(`Failed to delete property: ${err.response?.data?.msg || err.message}`);
    }
  };

  // ✅ Separate user's & others' properties
  const userProperties = properties.filter(p => p.userId === user?._id && applyFilters(p));
  const otherProperties = properties.filter(p => p.userId !== user?._id && applyFilters(p));

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gradient-to-br from-blue-100 via-white to-green-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-8">
          {/* <h1 className="text-3xl text-gray-800 font-extrabold mb-4 text-center">
            Available Properties
          </h1> */}

          {/* 🔍 Search Bar */}
         <PropertySearchBar onSearch={setFilters} />

          {loading && <p className="text-center text-gray-600">Loading properties...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}

          {!loading && !error && userProperties.length === 0 && otherProperties.length === 0 && (
            <p className="text-center text-gray-600 mt-6">No properties match your filters.</p>
          )}

          {/* User's own properties */}
          {userProperties.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Your Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {userProperties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={{
                      id: property._id,
                      title: property.title || 'No Title',
                      location: `${property.address?.street || ''}, ${property.address?.city || ''}, ${property.address?.state || ''}`,
                      price: `₹${parseFloat(property.price || 0).toLocaleString('en-IN')}${property.listingType === 'For Rent' ? '/month' : ''}`,
                      image: property.images?.[0] || 'https://via.placeholder.com/600x400',
                      contactName: property.contactName || 'Not Added',
                      contactPhone: property.contactPhone || 'Not Added',
                      contactEmail: property.contactEmail || 'Not Added',
                    }}
                    onDelete={() => handleDeleteProperty(property._id)}
                    onEdit={() => {
                      setEditProperty(property);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other users' properties */}
          {otherProperties.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Other Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {otherProperties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={{
                      id: property._id,
                      title: property.title || 'No Title',
                      location: `${property.address?.city || ''}, ${property.address?.state || ''}`,
                      price: `₹${parseFloat(property.price || 0).toLocaleString('en-IN')}${property.listingType === 'For Rent' ? '/month' : ''}`,
                      image: property.images?.[0] || 'https://via.placeholder.com/600x400',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ➕ Floating Add Button */}
          {user?.role !== 'admin' && (
            <div className="fixed bottom-6 right-6 z-50">
              <button
                onClick={() => {
                  setEditProperty(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center rounded-full h-14 w-14 text-white shadow-xl
                           bg-gradient-to-br from-blue-600 to-indigo-800
                           hover:from-blue-700 hover:to-indigo-900 transition-colors duration-200 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Add New Property"
              >
                <Plus className="h-8 w-8" />
              </button>
            </div>
          )}
        </div>
      </div>

      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditProperty(null);
        }}
        onAddProperty={handleAddProperty}
        onUpdateProperty={handleUpdateProperty}
        loggedInUser={{
          name: `${user?.firstName || ''} ${user?.lastName || ''}`,
          phone: user?.phone || '',
          email: user?.email || ''
        }}
        editProperty={editProperty}
      />
    </>
  );
};

export default Properties;
