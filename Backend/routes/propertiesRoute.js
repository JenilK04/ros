// backend/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const {getbyidProperties,getAllProperties,postProperty} = require('../controller/propertiesController');
const {verifyToken} = require('../middleware/verifyToken');

router.use(verifyToken); // Apply token verification middleware to all routes

// POST /api/properties - Add a new property
router.post('/', postProperty);
// GET /api/properties - Get all properties
router.get('/', getAllProperties);

router.get('/:id', getbyidProperties);
module.exports = router;