import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Navbar from './navbar';
import posthog from 'posthog-js';
import {
  MapPin,
  Building,
  Calendar,
  Phone,
  Mail,
  ArrowLeft,
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await API.get(`/projects/${id}`);
        setProject(response.data);
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError(err.response?.data?.msg || 'Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  useEffect(() => {
    if (id) {
      posthog.capture("project_view", {
        propertyId: id,
        $current_url: window.location.pathname,
      });
    }
  }, [id]);


  if (loading) return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    </>
  );

  if (!project) return null;


  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Projects
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <img
                src={project.images[activeImage] || 'https://via.placeholder.com/600x400'}
                alt={project.ProjectName}
                className="object-cover w-full h-full"
              />
            </div>
            {project.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {project.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-w-16 aspect-h-9 rounded-lg overflow-hidden ${
                      index === activeImage ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${project.ProjectName} ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.ProjectName}</h1>
                <p className="text-lg text-gray-600 mt-2">Developing by <span className="font-semibold">{project.DeveloperName}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Building className="h-5 w-5 mr-2" />
                <span>{project.ProjectType}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{project.ProjectStatus}</span>
              </div>
            </div>

            <div className="flex items-start text-gray-600">
              <MapPin className="h-5 w-5 mr-2 mt-1" />
              <p>
                {project.address.street}, {project.address.city},
                <br />
                {project.address.state} - {project.address.zip}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Unit Configurations</h2>
              <div className="grid grid-cols-1 gap-4">
                {project.unitConfigurations?.map((config, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{config.type}</h3>
                        <p className="text-sm text-gray-600 mt-1">Area: {config.area} sq ft</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Price Range:</p>
                        <p className="font-medium text-gray-800">
                          ₹{(config.minPrice || 0).toLocaleString()} - ₹{(config.maxPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!project.unitConfigurations || project.unitConfigurations.length === 0) && (
                  <p className="text-gray-600">No unit configurations available</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{project.description}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Contact Details</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2" />
                  <a href={`tel:${project.contactPhone}`} className="text-blue-600 hover:underline"><span>{project.contactPhone}</span></a>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  <a href={`mailto:${project.contactEmail}`} className="text-blue-600 hover:underline">
                    <span>{project.contactEmail}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;