import React, { useState, useEffect } from "react";
import { X, MapPin, Building, User2 } from "lucide-react";

const ProjectSearchBar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    location: "",
    ProjectType: "",
    ProjectStatus: "",
    DeveloperName: ""
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
      ProjectType: "",
      ProjectStatus: "",
      DeveloperName: ""
    };
    setFilters(cleared);
    onSearch(cleared);
  };

  const isFiltered =
    filters.location ||
    filters.ProjectType ||
    filters.ProjectStatus ||
    filters.DeveloperName;

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
            placeholder="Location"
            className="flex-1 outline-none bg-transparent border-b lg:border-0 pb-1 lg:pb-0 w-full"
          />
        </div>

        {/* Project Type */}
        <div className="flex items-center gap-2 flex-1">
          <Building className="w-5 h-5 text-purple-500" />
          <select
            name="ProjectType"
            value={filters.ProjectType}
            onChange={handleChange}
            className="outline-none bg-transparent border-b lg:border-0 pb-1 lg:pb-0 w-full"
          >
            <option value="">Any Type</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Township">Township</option>
            <option value="Commercial">Commercial</option>
            <option value="Mixed-use">Mixed-Use</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        {/* Project Status */}
        <div className="flex items-center gap-2 flex-1">
          <Building className="w-5 h-5 text-pink-500" />
          <select
            name="ProjectStatus"
            value={filters.ProjectStatus}
            onChange={handleChange}
            className="outline-none bg-transparent border-b lg:border-0 pb-1 lg:pb-0 w-full"
          >
            <option value="">Any Status</option>
            <option value="Under Construction">Under Construction</option>
            <option value="Ready to Move">Ready to Move</option>
            <option value="Upcoming">Upcoming</option>
          </select>
        </div>

        {/* Developer Name */}
        <div className="flex items-center gap-2 flex-1">
          <User2 className="w-5 h-5 text-green-500" />
          <input
            type="text"
            name="DeveloperName"
            value={filters.DeveloperName}
            onChange={handleChange}
            placeholder="Developer Name"
            className="flex-1 outline-none bg-transparent border-b lg:border-0 pb-1 lg:pb-0 w-full"
          />
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="text-red-500 hover:bg-red-100 rounded-full transition self-end lg:self-center"
            title="Clear Filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectSearchBar;