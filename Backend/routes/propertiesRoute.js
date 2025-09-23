// backend/routes/propertyRoutes.js
import express from 'express';
import {getbyidProperties,getAllProperties,postProperty, addInquiry,removeInquiry,deleteProperty,updateProperty,generateAR,getARProgress,downloadAR} from '../controller/propertiesController.js';
import {verifyToken} from '../middleware/verifyToken.js';

const router = express.Router();

router.use(verifyToken); // Apply token verification middleware to all routes
router.post('/', postProperty);
router.get('/', getAllProperties);
router.post('/:id/inquiry', addInquiry);      
router.delete('/:id/inquiry', removeInquiry);
router.delete('/:id', deleteProperty);
router.put('/:id', updateProperty);
router.get('/:id', getbyidProperties);
router.post("/:id/generate-ar", generateAR);
router.get("/:id/ar-progress", getARProgress);
router.get("/:id/download-ar", downloadAR);


export default router;