import express from 'express';
const router = express.Router();

import { getAllUsers, isAdmin,deleteUser } from '../controller/adminController.js';


router.get('/users', getAllUsers);
router.get('/users/:id', isAdmin);
router.delete('/users/:id', deleteUser);

export default router;