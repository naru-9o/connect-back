import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  startupName: {
    type: String,
    required: [true, 'Startup name is required'],
    trim: true,
    maxlength: [100, 'Startup name cannot exceed 100 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    enum: [
      'FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'FoodTech', 
      'PropTech', 'RetailTech', 'AI/ML', 'Blockchain', 'IoT', 'SaaS', 'E-commerce'
    ]
  },
  fundingStage: {
    type: String,
    required: [true, 'Funding stage is required'],
    enum: ['Idea Stage', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth Stage']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    minlength: [50, 'Bio must be at least 50 characters'],
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  profileImage: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('User', userSchema);