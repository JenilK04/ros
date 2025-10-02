import express from 'express';
const router = express.Router();

import { verifyToken } from '../middleware/verifyToken.js';
import { getNotifications } from '../controller/notifyInquiryController.js';

router.use(verifyToken);
router.get('/notifications', getNotifications);

export default router;
