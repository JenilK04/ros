const Property = require('../models/Property');
const mongoose = require('mongoose');
const getbyidProperties = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Optional: Validate if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ msg: 'Invalid property ID format.' });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ msg: 'Property not found.' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error fetching single property:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

const postProperty = async (req, res) => {
  try {
    const {
      title, listingType, propertyType, price,
      street, city, state, zip, country,
      description, bedrooms, bathrooms, area, contactName, contactPhone,
      images // <-- This will now directly contain Base64 strings
    } = req.body;

    // Basic validation
    if (!title || !listingType || !propertyType || !price || !street || !city || !state || !zip || !country || !description) {
      return res.status(400).json({ msg: 'Please enter all required fields for the property.' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ msg: 'At least one image is required.' });
    }

    const totalImageSize = images.reduce((acc, img) => acc + img.length, 0);

    if (totalImageSize > (5 * 1024 * 1024))
        return res.status(413).json({ msg: 'Image data is too large. Max 5MB total per property.' });
    
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
      images: images, // Store Base64 strings directly
      contactName,
      contactPhone
    });
   
    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty) // 201 Created
   } catch (error) {
    console.error('Error adding property:', error);
    if (error.name === 'MongoServerError' && error.message.includes('Document exceeded max allowed bson size')) {
      return res.status(413).json({ msg: 'Property data (including images) is too large to save. Please use smaller images.' });
    }
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

module.exports = {
  getbyidProperties,
  getAllProperties,
  postProperty
};
