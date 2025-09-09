const Property = require('../models/Property');
const mongoose = require('mongoose');

// ✅ Get property by ID (show contact info only if inquire
const getbyidProperties = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user?.id; // from auth middleware

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ msg: "Invalid property ID format." });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ msg: "Property not found." });
    }

    let responseProperty = property.toObject();

    // ✅ Only remove contact info if no inquiries at all
    // If user has inquired, show contact info
    if (!responseProperty.inquiredBy.includes(userId)) {
      // Optionally, you can also hide contact info for non-authenticated users
      if (!userId) {
        delete responseProperty.contactName;
        delete responseProperty.contactPhone;
      }
    }

    res.json(responseProperty);
  } catch (error) {
    console.error("Error fetching single property:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};



// ✅ Get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// ✅ Add new property
const postProperty = async (req, res) => {
  try {
    const {
      title, listingType, propertyType, price,
      street, city, state, zip,
      description, bedrooms, bathrooms, area, contactName, contactPhone,contactEmail,
      images
    } = req.body;

    if (!title || !listingType || !propertyType || !price || !street || !city || !state || !zip  || !description) {
      return res.status(400).json({ msg: 'Please enter all required fields for the property.' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ msg: 'At least one image is required.' });
    }

    const totalImageSize = images.reduce((acc, img) => acc + img.length, 0);
    if (totalImageSize > (5 * 1024 * 1024)) {
      return res.status(413).json({ msg: 'Image data is too large. Max 5MB total per property.' });
    }

    const newProperty = new Property({
      title,
      listingType,
      propertyType,
      price,
      address: { street, city, state, zip},
      description,
      bedrooms: ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseInt(bedrooms) || 0 : 0,
      bathrooms: ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseFloat(bathrooms) || 0 : 0,
      area,
      images,
      contactName,
      contactPhone,
      contactEmail,
      inquiredBy: [],
      userId: req.user.id   // 👈 attach logged-in user’s ID here
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    console.error('Error adding property:', error);

    if (error.name === 'MongoServerError' && error.message.includes('Document exceeded max allowed bson size')) {
      return res.status(413).json({ msg: 'Property data (including images) is too large to save. Please use smaller images.' });
    }

    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};


// ✅ Add inquiry

// ✅ Get properties inquired by the current user
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    // ✅ Allow owner OR admin to delete
    if (property.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to delete this property' });
    }
    
    await property.deleteOne();
    res.status(200).json({ msg: 'Property deleted successfully' });
  } catch (err) {
    console.error('Delete Property Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};


const addInquiry = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: "Property not found" });

    // Ensure inquiredBy exists
    property.inquiredBy = property.inquiredBy || [];

    if (property.inquiredBy.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already inquired" });
    }

    property.inquiredBy.push(req.user.id);
    await property.save();

    res.json({ msg: "Inquiry added successfully", property });
  } catch (error) {
    console.error("Error adding inquiry:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const removeInquiry = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    const userId = req.user.id;

    property.inquiredBy = property.inquiredBy.filter(id => id.toString() !== userId);
    await property.save();

    res.json({ msg: 'Inquiry removed', property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, listingType, propertyType, price,
      street, city, state, zip,
      description, bedrooms, bathrooms, area, contactName, contactPhone, contactEmail,
      images
    } = req.body;

    // Build the update object
    const updatedData = {
      title, listingType, propertyType, price,
      address: { street, city, state, zip },  // wrap nested address
      description,
      bedrooms: ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseInt(bedrooms) || 0 : 0,
      bathrooms: ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseFloat(bathrooms) || 0 : 0,
      area,
      images,
      contactName,
      contactPhone,
      contactEmail
    };

    const property = await Property.findByIdAndUpdate(
      id,
      { $set: updatedData }, // use $set to update nested fields
      { new: true }
    );
  
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    res.json({ msg: 'Property updated successfully', property });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};



module.exports = {
  getbyidProperties,
  getAllProperties,
  postProperty,
  addInquiry,
  removeInquiry,
  deleteProperty,
  updateProperty
};
