// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to verify the JWT from the Authorization header
const verifyToken = (req, res, next) => {
  // Get token from header
  // It usually comes in the format "Bearer <token>"
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Authorization header missing or invalid format' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    // IMPORTANT: Use the environment variable here
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add the decoded user payload to the request object
    req.user = decoded;
    next();
  } catch (err) {
    // This block handles expired, invalid, or malformed tokens
    console.error('JWT verification failed:', err);
    return res.status(401).json({ msg: 'Invalid or expired token' });

  }
};

module.exports = {verifyToken};