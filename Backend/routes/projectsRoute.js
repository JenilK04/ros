// backend/routes/propertyRoutes.js
import express from 'express';
import {createProject,getProjects,getProjectById,updateProject,deleteProject} from '../controller/projectController.js';
import {verifyToken} from '../middleware/verifyToken.js';

const router = express.Router();

router.use(verifyToken); 
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
// router.get('/developer', getDeveloperProjects);
// router.get('/:id', getbyidProperties);
// router.post("/:id/generate-ar", generateAR);
// router.get("/:id/ar-progress", getARProgress);
// router.get("/:id/download-ar", downloadAR);


export default router;