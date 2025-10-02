import express from 'express';
const router = express.Router();

import { verifyToken } from '../middleware/verifyToken.js';
import { getNotifications, getMyLeads,privateChat,getChatMessages } from '../controller/notifyInquiryController.js';

router.use(verifyToken);
router.get('/notifications', getNotifications);
router.post("/chat/:propertyId", privateChat);
router.get("/chat/:propertyId", getChatMessages);
router.get('/myleads/:userId', getMyLeads);

export default router;
