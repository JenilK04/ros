const express = require('express');
const router = express.Router();

const { getAllUsers, isAdmin } = require('../controller/usersController');


router.get('/users', getAllUsers);
router.get('/users/:id', isAdmin);

module.exports = router;
