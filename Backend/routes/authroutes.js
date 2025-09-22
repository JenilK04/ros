import express from 'express';
const router = express.Router();

import { verifyToken } from '../middleware/verifyToken.js';
import { register, login, user, editUser } from '../controller/authcontroller.js';

router.post('/register', register);
router.post('/login', login);
router.get('/user/me', verifyToken, user);
router.put('/profile/:id', verifyToken, editUser);
export default router;
