const User = require('../models/Users');
const Admin = require('../models/Admin');
const mongoose = require('mongoose')

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the User collection, excluding the password field for security
    const allUsers = await User.find().select('-password'); 
    
    // Fetch all users from the Admin collection, also excluding the password
    const allAdmins = await Admin.find().select('-password'); 

    // Combine the two lists into a single array
    // We add a 'role' property to each object to easily identify the user type on the frontend
    const combinedUsers = [
      ...allUsers.map(user => ({
        ...user.toObject(),
        role: user.userType // Assuming your User model has a 'userType' field for Agent, Buyer, Seller, etc.
      })),
      ...allAdmins.map(admin => ({
        ...admin.toObject(),
        role: 'admin'
      }))
    ];

    // You can optionally sort the combined list here, for example by dateJoined
    // combinedUsers.sort((a, b) => new Date(b.dateJoined) - new Date(a.dateJoined));

    // Send the combined, sanitized user data to the frontend
    res.json(combinedUsers);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const isAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID format.' });
    }

    // Exclude sensitive information like password
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching single user:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

module.exports = { getAllUsers, isAdmin };