import React from 'react';
import Navbar from './navbar';

const sampleProperties = [
  {
    id: 1,
    title: 'Luxury Apartment in Downtown',
    location: 'New York, NY',
    price: '$1,200,000',
    image: 'https://via.placeholder.com/300x200', // replace with real images
  },
  {
    id: 2,
    title: 'Modern Villa with Pool',
    location: 'Los Angeles, CA',
    price: '$2,500,000',
    image: 'https://via.placeholder.com/300x200',
  },
  {
    id: 3,
    title: 'Cozy Cottage',
    location: 'Austin, TX',
    price: '$850,000',
    image: 'https://via.placeholder.com/300x200',
  },
];

const Properties = () => {
  return (
    <>
    <Navbar/>
    <div>
      <h1 className="text-2xl text-white bg-blue-700 font-bold mb-6 p-2">Available Properties</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{property.title}</h2>
              <p className="text-gray-500">{property.location}</p>
              <p className="text-green-600 font-bold mt-2">{property.price}</p>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Properties;
