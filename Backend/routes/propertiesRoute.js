// backend/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const {getbyidProperties,getAllProperties,postProperty, addInquiry,removeInquiry,deleteProperty,updateProperty} = require('../controller/propertiesController');
const {verifyToken} = require('../middleware/verifyToken');

router.use(verifyToken); // Apply token verification middleware to all routes
router.post('/', postProperty);
router.get('/', getAllProperties);
router.post('/:id/inquiry', addInquiry);      
router.delete('/:id/inquiry', removeInquiry);
router.delete('/:id', deleteProperty);
router.put('/:id', updateProperty);
router.get('/:id', getbyidProperties);

module.exports = router;