import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';


// @desc    Get all users (for networking)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const { search, industry, fundingStage, location, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { 
      _id: { $ne: req.user.id }, // Exclude current user
      isActive: true 
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { startupName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    if (industry) query.industry = industry;
    if (fundingStage) query.fundingStage = fundingStage;
    if (location) query.location = { $regex: location, $options: 'i' };

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ VALIDATION ERRORS:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, startupName, industry, fundingStage, location, bio } = req.body;
    const profileImageUrl = req.file?.path;

    const updatedData = {
      name,
      startupName,
      industry,
      fundingStage,
      location,
      bio
    };

    if (profileImageUrl) {
      updatedData.profileImage = profileImageUrl;
    }

    // ✅ ADD MORE DETAILED USER ID CHECKING
    const userId = req.user._id;
    
    if (!userId) {
      console.log('❌ NO USER ID FOUND');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - user ID not found'
      });
    }

    // ✅ ADD DATABASE UPDATE LOGGING
    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
      runValidators: true
    });
    
    if (!user) {
      console.log('❌ USER NOT FOUND IN DATABASE WITH ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('❌ UPDATE PROFILE ERROR:', error);
    console.error('❌ ERROR MESSAGE:', error.message);
    console.error('❌ ERROR STACK:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};