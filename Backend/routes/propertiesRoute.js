// backend/routes/propertyRoutes.js
const express = require('express');
const Property = require('../models/Property');

const router = express.Router();

// --- API Endpoints ---

// POST /api/properties - Add a new property
router.post('/', async (req, res) => {
  try {
    const {
      title, listingType, propertyType, price,
      street, city, state, zip, country,
      description, bedrooms, bathrooms, area,
      images // <-- This will now directly contain Base64 strings
    } = req.body;

    // Basic validation
    if (!title || !listingType || !propertyType || !price || !street || !city || !state || !zip || !country || !description) {
      return res.status(400).json({ msg: 'Please enter all required fields for the property.' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ msg: 'At least one image is required.' });
    }

    // IMPORTANT: Check document size here before saving if you are concerned about 16MB limit
    // This is hard to do precisely without knowing the full document size, but a general check
    // can be done on the total length of Base64 strings.
    const totalImageSize = images.reduce((acc, img) => acc + img.length, 0);
    // Rough estimate: 16MB is 16 * 1024 * 1024 bytes.
    // Base64 string length is approx 4/3 * original_binary_size.
    // So, original_binary_size is approx 3/4 * base64_string_length.
    // Max Base64 length could be around 20MB for 15MB binary.
    // You might want to set a more conservative limit here, e.g., 5MB total Base64
    if (totalImageSize > (5 * 1024 * 1024)) { // Example: 5MB limit for total image data
        return res.status(413).json({ msg: 'Image data is too large. Max 5MB total per property.' });
    }


    const newProperty = new Property({
      title,
      listingType,
      propertyType,
      price,
      address: { street, city, state, zip, country },
      description,
      bedrooms: ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseInt(bedrooms) || 0 : 0,
      bathrooms: ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseFloat(bathrooms) || 0 : 0,
      area: ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseInt(area) || 0 : 0,
      images: images // Store Base64 strings directly
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty); // 201 Created
  } catch (error) {
    console.error('Error adding property:', error);
    if (error.name === 'MongoServerError' && error.message.includes('Document exceeded max allowed bson size')) {
      return res.status(413).json({ msg: 'Property data (including images) is too large to save. Please use smaller images.' });
    }
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// GET /api/properties - Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;