const User = require('../models/Users');
const Admin = require('../models/Admin')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ ...rest, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Check if the user is Admin
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials for admin' });

      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        token,
        role: admin.role
      });
    }

    // Step 2: Check in User collection
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: 'user', userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: 'user',
      userType: user.userType,
      name: user.firstName+" "+user.lastName,
      phone: user.phone,
      email: user.email,
      address: user.address,
      city: user.city,
      zip: user.zip,
      state: user.state,
      country: user.country,
      companyName: user.companyName,
      licenseNumber: user.licenseNumber,
      experience: user.experience,
      specialization: user.specialization,
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
module.exports = {
  register,
  login
};
