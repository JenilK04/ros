const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/verifyToken')
const { register, login, user} = require('../controller/authcontroller');

router.post('/register', register);
router.post('/login', login);
router.get('/user/me',verifyToken,user)
module.exports = router;
