const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/verifyToken')
const { register, login, user,editUser} = require('../controller/authcontroller');

router.post('/register', register);
router.post('/login', login);
router.get('/user/me',verifyToken,user)
router.put('/profile/:id',verifyToken,editUser)
module.exports = router;
