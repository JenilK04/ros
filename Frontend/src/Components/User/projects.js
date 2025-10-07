// src/components/Properties.jsx

import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import ProjectCard from './projectCard'; // Replace PropertyCard import
import AddProjectModal from './addProjectModel';
import PropertySearchBar from './propertySearchbar';
import { Plus } from 'lucide-react';
import API from '../../services/api';
import { useUser } from '../../Context/userContext';

const Projects = () => {
  const { user } = useUser();
  const isDeveloper = user?.userType === 'developer';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    ProjectType: "",
    ProjectStatus: "",
  });

  // Fetch properties from backend
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/projects');
      setProjects(response.data || []);
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

  // Client-side filtering
  const applyFilters = (project) => {
    const address = project.address || {};
    const matchesLocation =
      !filters.location ||
      ['street', 'city', 'state'].some((field) =>
        address[field]?.toLowerCase().includes(filters.location.toLowerCase())
      );

    return (
      matchesLocation &&
      (!filters.ProjectType || project.ProjectType === filters.ProjectType) &&
      (!filters.ProjectStatus || project.ProjectStatus === filters.ProjectStatus)
    );
  };

  // Project handlers
  const handleAddProject = async (newProjectData) => {
    try {
      const token = localStorage.getItem('token');
      await API.post('/projects', newProjectData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Project added successfully!');
      setIsModalOpen(false);
      fetchProperties();
    } catch (err) {
      console.error('Error adding project:', err);
      alert(`Failed to add project: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleUpdateProject = async (id, updatedProjectData) => {
    try {
      const token = localStorage.getItem('token');
      await API.put(`/projects/${id}`, updatedProjectData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Project updated successfully!');
      setIsModalOpen(false);
      setEditProject(null);
      fetchProperties();
    } catch (err) {
      console.error('Error updating project:', err);
      alert(`Failed to update project: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token');
      await API.delete(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Project deleted successfully!');
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert(`Failed to delete project: ${err.response?.data?.msg || err.message}`);
    }
  };

  // Separate projects
  const userProjects = projects.filter(
    (p) => p.userId === user?._id && applyFilters(p)
  );
  const otherProjects = projects.filter(
    (p) => p.userId !== user?._id && applyFilters(p)
  );

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gradient-to-br from-blue-100 via-white to-green-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-8">
          <PropertySearchBar onSearch={setFilters} />

          {loading && <p className="text-center text-gray-600">Loading projects...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
          {!loading && !error && userProjects.length === 0 && otherProjects.length === 0 && (
            <p className="text-center text-gray-600 mt-6">No projects match your filters.</p>
          )}

          {/* User's own projects */}
          {userProjects.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={{
                      id: project._id,
                      ProjectName: project.ProjectName,
                      DeveloperName: project.DeveloperName,
                      ProjectType: project.ProjectType,
                      ProjectStatus: project.ProjectStatus,
                      location: `${project.address?.city}, ${project.address?.state}`,
                      UnitConfiguration: project.UnitConfiguration,
                      image: project.images?.[0] || 'https://via.placeholder.com/600x400'
                    }}
                    onDelete={() => handleDeleteProject(project._id)}
                    onEdit={() => {
                      setEditProject(project);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other projects */}
          {otherProjects.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Other Projects</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={{
                      id: project._id,
                      ProjectName: project.ProjectName,
                      DeveloperName: project.DeveloperName,
                      ProjectType: project.ProjectType,
                      ProjectStatus: project.ProjectStatus,
                      location: `${project.address?.city}, ${project.address?.state}`,
                      UnitConfiguration: project.UnitConfiguration,
                      image: project.images?.[0] || 'https://via.placeholder.com/600x400'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add Project Button (Developer Only) */}
          {isDeveloper && (
            <div className="fixed bottom-6 right-6 z-50">
              <button
                onClick={() => {
                  setEditProject(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center rounded-full h-14 w-14 text-white shadow-xl bg-gradient-to-br from-blue-600 to-indigo-800 hover:from-blue-700 hover:to-indigo-900 transition-colors duration-200"
                title="Add New Project"
              >
                <Plus className="h-8 w-8" />
              </button>
            </div>
          )}

          {/* Project Modal */}
          {isModalOpen && (
            <AddProjectModal
              isOpen={true}
              onClose={() => {
                setIsModalOpen(false);
                setEditProject(null);
              }}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              loggedInUser={{
                name: `${user?.firstName || ''} ${user?.lastName || ''}`,
                phone: user?.phone || '',
                email: user?.companyEmail || '',
                developerName: user?.companyName || ''
              }}
              editProject={editProject}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Projects;
