import express from 'express';
import { body } from 'express-validator';
import { getUsers, getUserById, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/multer.js';


const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
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

// Routes
router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, upload.single('profileImage'), updateProfileValidation, updateProfile);

export default router;