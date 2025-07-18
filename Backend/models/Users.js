const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  country: String,
  password: String,
  userType: { type: String, default: 'buyer' },
  companyName: String,
  licenseNumber: String,
  experience: String,
  specialization: [String]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
