// src/components/PropertyCard.jsx
import React from 'react';
import { MapPin, Trash2 } from 'lucide-react'; // Added Trash2 icon
import { Link } from 'react-router-dom';

const PropertyCard = ({ property, onDelete }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
    >
      <img
        src={property.image}
        alt={property.title}
        className="w-full h-48 object-cover object-center"
      />
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h2>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
          <p className="text-sm">{property.location}</p>
        </div>
        <div className="flex items-center text-green-700 font-bold text-lg mb-2">
          <p>{property.price}{property.listingType === 'For Rent' ? '/month' : ''}</p>
        </div>
        
        {/* {property.contactName && (
          <div className="flex items-center text-gray-700 text-sm mb-1">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <p>{property.contactName}</p>
          </div>
        )}
        {property.contactPhone && (
          <div className="flex items-center text-gray-700 text-sm mb-4">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <a href={`tel:${property.contactPhone}`} className="hover:underline text-blue-600">
              {property.contactPhone}
            </a>
          </div>
        )} */}

        {/* View Details button */}
        <Link 
          to={`/properties/${property.id}`}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 block text-center"
        >
          View Details
        </Link>

        {/* Delete button (optional, only if onDelete is passed) */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-200"
          >
          <Trash2 className="h-4 w-4" /> Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
