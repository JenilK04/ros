import Project from '../models/projects.js';

// Create a new project
export const createProject = async (req, res, next) => {
  try {
    // Add the userId from the authenticated user
    const newProject = new Project({
      ...req.body,
      userId: req.user.id // Assuming you have user info in req.user from auth middleware
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all projects (with optional filters)
export const getProjects = async (req, res, next) => {
  try {
    const filters = {};
    
    // Add query filters if they exist
    if (req.query.ProjectType) filters.ProjectType = req.query.ProjectType;
    if (req.query.ProjectStatus) filters.ProjectStatus = req.query.ProjectStatus;
    if (req.query.city) filters['address.city'] = new RegExp(req.query.city, 'i');
    
    const projects = await Project.find(filters).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get projects by developer (userId)
// export const getDeveloperProjects = async (req, res, next) => {
//   try {
//     const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });
//     res.status(200).json(projects);
//   } catch (err) {
//     next(createError(500, err.message));
//   }
// };

// Get single project by ID
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, 'Project not found'));
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update project
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, 'Project not found'));
    
    // Check if user is the owner
    if (project.userId.toString() !== req.user.id) {
      return next(createError(403, 'You can only update your own projects'));
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete project
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, 'Project not found'));
    
    // Check if user is the owner
    if (project.userId.toString() !== req.user.id) {
      return next(createError(403, 'You can only delete your own projects'));
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Project has been deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search projects
// export const searchProjects = async (req, res, next) => {
//   try {
//     const { query, type, status, minPrice, maxPrice } = req.query;
    
//     const searchQuery = {};
    
//     // Text search across multiple fields
//     if (query) {
//       searchQuery.$or = [
//         { ProjectName: new RegExp(query, 'i') },
//         { DeveloperName: new RegExp(query, 'i') },
//         { 'address.city': new RegExp(query, 'i') },
//         { 'address.state': new RegExp(query, 'i') }
//       ];
//     }
    
//     // Add filters if provided
//     if (type) searchQuery.ProjectType = type;
//     if (status) searchQuery.ProjectStatus = status;
//     if (minPrice) searchQuery.price = { $gte: parseFloat(minPrice) };
//     if (maxPrice) {
//       searchQuery.price = { ...searchQuery.price, $lte: parseFloat(maxPrice) };
//     }

//     const projects = await Project.find(searchQuery).sort({ createdAt: -1 });
//     res.status(200).json(projects);
//   } catch (err) {
//     next(createError(500, err.message));
//   }
// };

// Get project statistics
// export const getProjectStats = async (req, res, next) => {
//   try {
//     const stats = await Project.aggregate([
//       {
//         $group: {
//           _id: '$ProjectType',
//           count: { $sum: 1 },
//           avgArea: { $avg: '$area' }
//         }
//       }
//     ]);

//     const statusStats = await Project.aggregate([
//       {
//         $group: {
//           _id: '$ProjectStatus',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     res.status(200).json({
//       byType: stats,
//       byStatus: statusStats
//     });
//   } catch (err) {
//     next(createError(500, err.message));
//   }
// };