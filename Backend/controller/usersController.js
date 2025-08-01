const User = require('../models/Users');
const Admin = require('../models/Admin');

/**
 * @desc    Get a list of all user data for the admin panel
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
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

module.exports = { getAllUsers };