import express from 'express';
const router = express.Router();

import { verifyToken } from '../middleware/verifyToken.js';
import { getNotifications, getMyLeads,privateChat,getChatMessages, deleteLead } from '../controller/notifyInquiryController.js';

router.use(verifyToken);
router.get('/notifications', getNotifications);
router.post("/chat/:propertyId", privateChat);
router.get("/chat/:propertyId", getChatMessages);
router.get('/myleads/:userId', getMyLeads);
router.delete("/myleads/:propertyId/:userId", deleteLead);

export default router;
