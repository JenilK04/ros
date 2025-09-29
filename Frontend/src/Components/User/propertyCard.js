// src/components/PropertyCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2 } from 'lucide-react';

const PropertyCard = ({ property, isInquired }) => {
    return (
        <div className="relative group">
            
            {/* Inquired Badge: Renders only if isInquired is true */}
            {isInquired && (
                <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <CheckCircle2 size={14} />
                    <span>Inquired</span>
                </div>
            )}

            <div
                className={`
                    bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col
                    transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-2xl
                    ${isInquired ? 'border-2 border-green-500' : 'border border-gray-100'}
                `}
            >
                <Link to={`/properties/${property.id}`} className="block">
                    <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                    />
                    <div className="p-4 flex flex-col flex-grow">
                        <h2 className="text-lg font-bold text-gray-800 mb-1 truncate" title={property.title}>
                            {property.title}
                        </h2>
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                            <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
                            <p className="truncate" title={property.location}>{property.location}</p>
                        </div>
                        <div className="mt-auto">
                            <p className="text-lg font-semibold text-gray-900">{property.price}</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;