// backend/models/Property.js
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  listingType: { type: String, required: true, enum: ['For Sale', 'For Rent'] },
  propertyType: { type: String, required: true }, // e.g., Apartment, House, Office, Land
  price: { type: Number, required: true, min: 0 },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  description: { type: String, required: true },
  // Residential specific fields (optional based on propertyType)
  bedrooms: { type: Number, min: 0, default: 0 },
  bathrooms: { type: Number, min: 0, default: 0 },
  area: { type: Number, min: 0, default: 0 },
   // in Sq. Ft.
   // Images will be stored as an array of URLs (strings)
  contactName: { type: String, required: true, trim: true },
  contactPhone: { type: String, required: true, trim: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', PropertySchema);