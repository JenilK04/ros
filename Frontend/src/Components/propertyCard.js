import { MapPin, IndianRupeeIcon } from 'lucide-react';

const PropertyCard = ({ property }) => {
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
        <div className="flex items-center text-green-700 font-bold text-lg">
          <IndianRupeeIcon className="h-5 w-5 mr-1" />
          <p>{property.price}</p>
        </div>
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;