// backend/controller/propertiesController.js
import Property from "../models/Property.js";
import mongoose from "mongoose";
import Notification from "../models/notification.js";
import Admin from "../models/Admin.js";
import User from "../models/Users.js";
import {generateARFromProperty} from "../middleware/tripoAI.js";
import adminNotification from "../models/adminNotification.js";

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
    const user = await User.findById(req.user.id);
    const admin = await Admin.findOne(); // assuming single admin
    const message = `${user.firstName + " " + user.lastName} updated property "${newProperty.title}".`;

    const notification = await adminNotification.create({
      recipientId: admin._id,  // seller
      senderId: req.user.id,
      propertyId: newProperty._id,
      message
    });

    // Real-time push via Socket.IO
    if (req.io) {
      req.io.to(newProperty.userId.toString()).emit("admin-notification", notification);
    }

    console.log('Property updated:', newProperty._id);
    res.json({ msg: "property updated & seller notified", property: savedProperty });

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

    // Update images if provided
    if (images && images.length > 0) {
        property.images = images;
    }

    // ✅ If images changed → regenerate AR
    const savedProperty = await property.save();
    const user = await User.findById(req.user.id);
    const admin = await Admin.findOne(); // assuming single admin
    const message = `${user.firstName + " " + user.lastName} edited property "${property.title}".`;

    const notification = await adminNotification.create({
      recipientId: admin._id,  // seller
      senderId: req.user.id,
      propertyId: property._id,
      message
    });

    // Real-time push via Socket.IO
    if (req.io) {
      req.io.to(property.userId.toString()).emit("admin-notification", notification);
    }

    console.log('Property updated:', property._id);
    res.json({ msg: "property updated & seller notified", property: savedProperty });
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
    const user = await User.findById(req.user.id);
    const admin = await Admin.findOne(); // assuming single admin
    const message = `${user.firstName + " " + user.lastName} deleted property "${property.title}".`;

    const notification = await adminNotification.create({
      recipientId: admin._id,  // seller
      senderId: req.user.id,
      propertyId: property._id,
      message
    });

    // Real-time push via Socket.IO
    if (req.io) {
      req.io.to(property.userId.toString()).emit("admin-notification", notification);
    }

    console.log('Property updated:', property._id);
    res.json({ msg: "property updated & seller notified", property: property });
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

    // Prevent duplicate inquiry
    if (property.inquiredBy.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already inquired" });
    }

    // Add buyer to inquiredBy
    property.inquiredBy.push(req.user.id);
    await property.save();

    // Send notification to seller
    const buyer = await User.findById(req.user.id);
    const message = `${buyer.firstName + " " + buyer.lastName} added your property "${property.title}" to inquiry.`;

    const notification = await Notification.create({
      recipientId: property.userId,  // seller
      senderId: req.user.id,
      propertyId: property._id,
      message
    });

    // Real-time push via Socket.IO
    if (req.io) {
      req.io.to(property.userId.toString()).emit("add-notification", notification);
    }

    res.json({ msg: "Inquiry added & seller notified", property });

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

     const buyer = await User.findById(req.user.id);
    const message = `${buyer.firstName + " " + buyer.lastName} removed your property "${property.title}" from inquiry.`;

    const notification = await Notification.create({
      recipientId: property.userId,  // seller
      senderId: req.user.id,
      propertyId: property._id,
      message
    });

    // Real-time push via Socket.IO
    if (req.io) {
      req.io.to(property.userId.toString()).emit("remove-notification", notification);
    }

    res.json({ msg: 'Inquiry removed', property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

import axios from "axios";
const TRIPO_API_KEY = process.env.TRIPO_API_KEY;

// In-memory store for AR progress
const arProgressStore = {}; 

const generateAR = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ msg: "Property not found" });

    // Initialize progress store
    arProgressStore[propertyId] = { progress: 0, status: "running", taskId: null };

    // Run AR process
    generateARFromProperty(propertyId, (progress) => {
      arProgressStore[propertyId].progress = progress; // 0–100
    })
      .then((taskId) => {
        arProgressStore[propertyId].progress = 100;
        arProgressStore[propertyId].status = "success";
        arProgressStore[propertyId].taskId = taskId;
      })
      .catch((err) => {
        arProgressStore[propertyId].status = "failed";
        console.error("AR generation failed:", err.message);
      });

    res.json({ msg: "AR generation started" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const getARProgress = (req, res) => {
  const propertyId = req.params.id;
  const progressData = arProgressStore[propertyId];
  if (!progressData) return res.status(404).json({ msg: "No task found" });
  res.json(progressData);
};

const downloadAR = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ msg: "Property not found" });

    // Check if AR task exists
    if (!property.arTaskId) {
      return res.status(400).json({ msg: "AR model not generated yet. Please generate first." });
    }

    // Get fresh task info from Tripo
    const tripoRes = await axios.get(
      `https://api.tripo3d.ai/v2/openapi/task/${property.arTaskId}`,
      { headers: { Authorization: `Bearer ${TRIPO_API_KEY}` } }
    );

    const taskData = tripoRes.data?.data;
    if (!taskData || taskData.status !== "success") {
      return res.status(400).json({ msg: "AR model not ready yet", status: taskData?.status || "unknown" });
    }

    // Fresh signed download link (valid ~60s)
    const modelUrl = taskData.output?.model || taskData.output?.base_model || taskData.output?.pbr_model;
    if (!modelUrl) return res.status(404).json({ msg: "No downloadable model found" });

    res.json({ arModel: modelUrl });
  } catch (err) {
    console.error("Error fetching AR download link:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export {
  getbyidProperties,
  getAllProperties,
  postProperty,
  updateProperty,
  deleteProperty,
  addInquiry,
  removeInquiry,
  generateAR,
  getARProgress,
  downloadAR
};
