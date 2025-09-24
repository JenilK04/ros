import express from 'express';

const router = express.Router();
import { addEvent, getEvents, deleteEvent, getEventById } from '../controller/eventController.js';
import { verifyToken } from '../middleware/verifyToken.js';

router.use(verifyToken); // Apply token verification middleware to all routes in this router
router.post('/events', addEvent);
router.get('/events', getEvents);
router.get('/events/:eventId', getEventById);
router.delete('/events/:eventId', deleteEvent);

export default router;