import express from 'express';
const router = express.Router();

import { getAnalytics, pageViewsAnalytics,getPropertyViewStats, userActivity } from '../controller/postHogController.js';
import { verifyToken } from '../middleware/verifyToken.js';

router.use(verifyToken);
router.get('/', getAnalytics);
router.get('/pageviews', pageViewsAnalytics);
router.get('/propertyviews', getPropertyViewStats);
router.get("/user-events/:userId",userActivity)
export default router;