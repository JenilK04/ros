const express = require('express');
const router = express.Router();

const { register, login, getProfile, updateProfile} = require('../controller/authcontroller');

router.post('/register', register);
router.post('/login', login);
module.exports = router;
