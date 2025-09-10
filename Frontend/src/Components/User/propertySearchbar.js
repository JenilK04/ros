import React, { useState, useEffect } from "react";
import { XCircle, MapPin, Home, IndianRupee, ClipboardList } from "lucide-react";

const PropertySearchBar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    location: "",
    listingType: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  const clearFilters = () => {
    const cleared = {
      location: "",
      listingType: "",
      propertyType: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(cleared);
    onSearch(cleared);
  };

  const isFiltered =
    filters.location ||
    filters.listingType ||
    filters.propertyType ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <div className="bg-white shadow-md rounded-2xl px-4 py-4 w-full max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6 gap-4">
        {/* Location */}
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="w-5 h-5 text-blue-500" />
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Where?"
            className="flex-1 outline-none bg-transparent border-b lg:border-0 pb-1 lg:pb-0 w-full"
          />
        </div>

        {/* Listing Type */}
        <div className="flex items-center gap-2 flex-1">
          <ClipboardList className="w-5 h-5 text-purple-500" />
          <select
            name="listingType"
            value={filters.listingType}
            onChange={handleChange}
            className="outline-none bg-transparent border-b lg:border-0 pb-1 lg:pb-0 w-full"
          >
            <option value="">Any Listing</option>
            <option value="For Sale">For Sale</option>
            <option value="For Rent">For Rent</option>
          </select>
        </div>

        {/* Property Type */}
        <div className="flex items-center gap-2 flex-1">
          <Home className="w-5 h-5 text-pink-500" />
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
            className="outline-none bg-transparent border-b lg:border-0 pb-1 lg:pb-0 w-full"
          >
            <option value="">Any Type</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Shop">Shop</option>
            <option value="Land">Land</option>
            <option value="Condo">Condo</option>
            <option value="Office">Office</option>
            <option value="Warehouse">Warehouse</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2 flex-1">
          <IndianRupee className="w-5 h-5 text-green-500" />
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="Min"
            className="w-full lg:w-20 bg-transparent outline-none border-b lg:border-0 pb-1 lg:pb-0"
          />
          <span className="hidden lg:inline">-</span>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="Max"
            className="w-full lg:w-20 bg-transparent outline-none border-b lg:border-0 pb-1 lg:pb-0"
          />
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="text-red-500 hover:bg-red-100 rounded-full p-1 transition self-end lg:self-center"
            title="Clear Filters"
          >
            <XCircle className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertySearchBar;
