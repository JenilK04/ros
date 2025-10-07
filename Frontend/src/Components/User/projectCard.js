import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building, Edit, Trash2 } from 'lucide-react';  // Update imports

const ProjectCard = ({ project, onEdit, onDelete }) => {
    const isOwner = onEdit && onDelete;

    return (
        <div className="relative group">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col
                transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-2xl
                border border-gray-100">
                
                {/* Project Status Badge */}
                <div className="absolute top-2 left-2 z-10">
                    <span className={`
                        px-2 py-1 text-xs font-semibold rounded-full
                        ${project.ProjectStatus === 'Under Construction' ? 'bg-yellow-100 text-yellow-800' :
                          project.ProjectStatus === 'Ready to Move' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'}
                    `}>
                        {project.ProjectStatus}
                    </span>
                </div>

                <Link to={`/projects/${project.id}`} className="block">
                    <div className="relative">
                        <img
                            src={project.image}
                            alt={project.ProjectName}
                            className="w-full h-48 object-cover"
                        />
                        {/* Project Type Overlay */}
                        <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded-lg
                            text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {project.ProjectType}
                        </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                        <h2 className="text-lg font-bold text-gray-800 mb-1 truncate" 
                            title={project.ProjectName}>
                            {project.ProjectName}
                        </h2>
                        
                        <p className="text-sm text-gray-600 mb-2 truncate" 
                            title={project.DeveloperName}>
                            By {project.DeveloperName}
                        </p>

                        <div className="flex items-center text-gray-500 text-sm mb-2">
                            <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
                            <p className="truncate" title={project.location}>
                                {project.location}
                            </p>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                            <p className="truncate" title={project.UnitConfiguration}>
                                {project.UnitConfiguration}
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Action Buttons for Owner */}
                {isOwner && (
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 
                        transition-opacity flex gap-1">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onEdit();
                            }}
                            className="p-1.5 bg-white rounded-full shadow-md hover:bg-blue-50 
                                text-blue-600 transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onDelete();
                            }}
                            className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 
                                text-red-600 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;