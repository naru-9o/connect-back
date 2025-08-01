import express from 'express';
import { body } from 'express-validator';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  rsvpEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/multer.js'; // <-- Cloudinary multer config

const router = express.Router();

// Validation rules
const eventValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('date').isISO8601().toDate().withMessage('Please enter a valid date'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please enter a valid time (HH:MM)'),
  body('location').trim().isLength({ min: 5 }).withMessage('Location must be at least 5 characters'),
  body('maxAttendees').isInt({ min: 1, max: 1000 }).withMessage('Max attendees must be between 1 and 1000'),
  body('tags').isArray().withMessage('Tags must be an array')
];

// Routes
router.get('/', protect, getEvents);
router.get('/:id', protect, getEventById);

// ⬇️ Add upload.single('image') for image upload in Cloudinary
router.post('/', protect, upload.single('image'), eventValidation, createEvent);
router.put('/:id', protect, upload.single('image'), eventValidation, updateEvent);

router.post('/:id/rsvp', protect, rsvpEvent);
router.delete('/:id', protect, deleteEvent);

export default router;
