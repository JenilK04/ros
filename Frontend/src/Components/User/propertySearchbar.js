import React, { useState, useEffect } from "react";
import { XCircle, MapPin, Home, IndianRupee, ClipboardList } from "lucide-react";
 // ✅ icons

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

  // ✅ Auto-run search whenever filters change
  useEffect(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  // ✅ Reset all filters
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

  // Check if any filter is active
  const isFiltered =
    filters.location ||
    filters.listingType ||
    filters.propertyType ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <div className="bg-white shadow-md rounded-full flex items-center gap-6 px-6 py-3 w-full max-w-5xl mx-auto">
      {/* Location */}
      <div className="flex items-center gap-2 flex-1">
        <MapPin className="w-5 h-5 text-blue-500" />
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="Where?"
          className="flex-1 outline-none bg-transparent"
        />
      </div>

      {/* Listing Type */}
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-purple-500" />
        <select
          name="listingType"
          value={filters.listingType}
          onChange={handleChange}
          className="outline-none bg-transparent"
        >
          <option value="">Any Listing</option>
          <option value="For Sale">For Sale</option>
          <option value="For Rent">For Rent</option>
        </select>
      </div>

      {/* Property Type */}
      <div className="flex items-center gap-2">
        <Home className="w-5 h-5 text-pink-500" />
        <select
          name="propertyType"
          value={filters.propertyType}
          onChange={handleChange}
          className="outline-none bg-transparent"
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
      <div className="flex items-center gap-2">
        <IndianRupee className="w-5 h-5 text-green-500" />
        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="Min"
          className="w-20 bg-transparent outline-none"
        />
        <span>-</span>
        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="Max"
          className="w-20 bg-transparent outline-none"
        />
      </div>

      {/* Clear Filters Button (icon only) */}
      {isFiltered && (
        <button
          onClick={clearFilters}
          className=" rounded-full text-red-500 hover:bg-red-100 transition"
          title="Clear Filters"
        >
          <XCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default PropertySearchBar;
