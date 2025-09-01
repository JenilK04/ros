const express = require('express');
const router = express.Router();

const { getAllUsers, isAdmin,deleteUser } = require('../controller/adminController');


router.get('/users', getAllUsers);
router.get('/users/:id', isAdmin);
router.delete('/users/:id', deleteUser);

module.exports = router;
