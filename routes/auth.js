import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('startupName').trim().isLength({ min: 2, max: 100 }).withMessage('Startup name must be between 2 and 100 characters'),
  body('industry').isIn([
    'FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'FoodTech', 
    'PropTech', 'RetailTech', 'AI/ML', 'Blockchain', 'IoT', 'SaaS', 'E-commerce'
  ]).withMessage('Please select a valid industry'),
  body('fundingStage').isIn([
    'Idea Stage', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth Stage'
  ]).withMessage('Please select a valid funding stage'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('bio').trim().isLength({ min: 50, max: 500 }).withMessage('Bio must be between 50 and 500 characters')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);

export default router;