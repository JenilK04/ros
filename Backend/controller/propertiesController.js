// backend/controller/propertiesController.js
const Property = require("../models/Property");
const mongoose = require("mongoose");
const {generateARFromProperty} = require("../middleware/tripoAI.js");

// ✅ Get property by ID
// backend/controller/propertiesController.js
const getbyidProperties = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ msg: "Invalid property ID format." });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ msg: "Property not found." });

    let responseProperty = property.toObject();

    // Hide contact info if not inquired
    if (!responseProperty.inquiredBy.includes(userId)) {
      if (!userId) {
        delete responseProperty.contactName;
        delete responseProperty.contactPhone;
        delete responseProperty.contactEmail;
      }
    }

    // Include AR progress in response
    // Default 0 if undefined
    responseProperty.arProgress = responseProperty.arProgress || 0;

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
      description, bedrooms, bathrooms, area,
      contactName, contactPhone, contactEmail,
      images
    } = req.body;

    if (!title || !listingType || !propertyType || !price ||
        !street || !city || !state || !zip || !description) {
      return res.status(400).json({ msg: 'Please enter all required fields for the property.' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ msg: 'At least one image is required.' });
    }

    const newProperty = new Property({
      title,
      listingType,
      propertyType,
      price,
      address: { street, city, state, zip },
      description,
      bedrooms: ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseInt(bedrooms) || 0 : 0,
      bathrooms: ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseFloat(bathrooms) || 0 : 0,
      area,
      images,
      contactName,
      contactPhone,
      contactEmail,
      inquiredBy: [],
      userId: req.user.id
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);

  } catch (error) {
    console.error('Error adding property:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// ✅ Update property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, listingType, propertyType, price,
      street, city, state, zip,
      description, bedrooms, bathrooms, area,
      contactName, contactPhone, contactEmail,
      images
    } = req.body;

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    property.title = title;
    property.listingType = listingType;
    property.propertyType = propertyType;
    property.price = price;
    property.address = { street, city, state, zip };
    property.description = description;
    property.bedrooms = ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseInt(bedrooms) || 0 : 0;
    property.bathrooms = ['Apartment', 'House', 'Condo'].includes(propertyType) ? parseFloat(bathrooms) || 0 : 0;
    property.area = area;
    property.contactName = contactName;
    property.contactPhone = contactPhone;
    property.contactEmail = contactEmail;

    // ✅ If images changed → regenerate AR
    const savedProperty = await property.save();
    res.json({ msg: 'Property updated successfully', property: savedProperty });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ✅ Delete property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });

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

// ✅ Add inquiry
const addInquiry = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: "Property not found" });

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

// ✅ Remove inquiry
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

const arProgressStore = {}; // { [propertyId]: { progress, status, arModel } }

const generateAR = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ msg: "Property not found" });

    // initialize progress
    arProgressStore[propertyId] = { progress: 0, status: "running", arModel: null };

    // Run AR process with callback
    generateARFromProperty(property, (progress) => {
      arProgressStore[propertyId].progress = progress; // 0–100
    })
      .then((modelUrl) => {
        arProgressStore[propertyId].progress = 100;
        arProgressStore[propertyId].status = "success";
        arProgressStore[propertyId].arModel = modelUrl;
      })
      .catch((err) => {
        arProgressStore[propertyId].status = "failed";
        console.error("AR generation failed:", err.message);
      });

    res.json({ msg: "AR generation started", taskId: propertyId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Endpoint to get progress
const getARProgress = (req, res) => {
  const taskId = req.params.id;
  const progressData = arProgressStore[taskId];
  if (!progressData) return res.status(404).json({ msg: "No task found" });
  res.json(progressData);
};



module.exports = {
  getbyidProperties,
  getAllProperties,
  postProperty,
  updateProperty,
  deleteProperty,
  addInquiry,
  removeInquiry,
  generateAR,
  getARProgress
};
