import express from 'express';
const router = express.Router();

import { getAnalytics, pageViewsAnalytics } from '../controller/postHogController.js';
import { verifyToken } from '../middleware/verifyToken.js';

router.use(verifyToken);
router.get('/', getAnalytics);
router.get('/pageviews', pageViewsAnalytics);
export default router;