import express from 'express';
const router = express.Router();

import { verifyToken } from '../middleware/verifyToken.js';
import { getNotifications, getMyLeads,privateChat,getChatMessages, deleteLead,getAdminNotifications } from '../controller/notifyInquiryController.js';

router.use(verifyToken);
router.get('/notifications', getNotifications);
router.get('/admin-notifications', getAdminNotifications);
router.post("/chat/:propertyId", privateChat);
router.get("/chat/:propertyId", getChatMessages);
router.get('/myleads/:userId', getMyLeads);
router.delete("/myleads/:propertyId/:userId", deleteLead);

export default router;
