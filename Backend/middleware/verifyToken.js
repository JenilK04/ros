const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // example: { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ msg: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
