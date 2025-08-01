import express from 'express';
import { body } from 'express-validator';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markAsRead 
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('receiver').isMongoId().withMessage('Invalid receiver ID'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters')
];

// Routes
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/', protect, sendMessageValidation, sendMessage);
router.put('/read/:userId', protect, markAsRead);

export default router;