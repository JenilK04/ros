import React, { useState } from 'react';
import Navbar from './navbar';
import PropertyCard from './propertyCard'; // Import the new PropertyCard component
import AddPropertyModal from './addProperty'; // Import the new AddPropertyModal component
import { Plus } from 'lucide-react';

const initialSampleProperties = [
  {
    id: 1,
    title: 'Luxury Apartment in Downtown',
    location: 'New York, NY',
    price: '1,200,000',
    image: 'https://via.placeholder.com/600x400/FF5733/FFFFFF?text=Luxury+Apartment',
  },
  {
    id: 2,
    title: 'Modern Villa with Pool',
    location: 'Los Angeles, CA',
    price: '2,500,000',
    image: 'https://via.placeholder.com/600x400/3366FF/FFFFFF?text=Modern+Villa',
  },
  {
    id: 3,
    title: 'Cozy Cottage',
    location: 'Austin, TX',
    price: '850,000',
    image: 'https://via.placeholder.com/600x400/33FF57/FFFFFF?text=Cozy+Cottage',
  },
  {
    id: 4,
    title: 'Spacious Family Home',
    location: 'Houston, TX',
    price: '450,000',
    image: 'https://via.placeholder.com/600x400/FF33FF/FFFFFF?text=Family+Home',
  },
  {
    id: 5,
    title: 'Riverside Condo',
    location: 'Miami, FL',
    price: '780,000',
    image: 'https://via.placeholder.com/600x400/33FFFF/FFFFFF?text=Riverside+Condo',
  },
];

const Properties = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Use state to manage properties if you want to add newly submitted ones to the list
  const [properties, setProperties] = useState(initialSampleProperties);

  const handleAddProperty = (newPropertyData) => {
    // In a real application, you'd send this data to a backend API
    // and then fetch updated properties or add the new property to state
    console.log("New property received in parent:", newPropertyData);

    // For demonstration, let's create a mock property object and add it to the list
    const newId = Math.max(...properties.map(p => p.id)) + 1; // Simple ID generation
    const newProperty = {
      id: newId,
      title: newPropertyData.title,
      location: `${newPropertyData.city}, ${newPropertyData.state}`, // Combine address for display
      price: `$${parseFloat(newPropertyData.price).toLocaleString()}`, // Format price
      // For images, you'd ideally get a URL from your backend after upload
      // For now, let's use the first image preview or a fallback placeholder
      image: newPropertyData.imagePreviews[0] || 'https://via.placeholder.com/600x400/CCCCCC/FFFFFF?text=New+Property',
    };
    setProperties((prevProperties) => [...prevProperties, newProperty]);

    alert('Property added successfully! (See console for full details)');
  };

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8">
          <h1 className="text-3xl text-gray-800 font-extrabold mb-8 text-center">Available Properties</h1>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Fixed Plus Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsModalOpen(true)}
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
      />
    </>
  );
};

export default Properties;