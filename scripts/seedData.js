import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';

// Load env vars
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      name: 'Sarah Chen',
      email: 'sarah@techstartup.com',
      password: 'password123',
      startupName: 'EcoTech Solutions',
      industry: 'CleanTech',
      fundingStage: 'Seed',
      location: 'San Francisco, CA',
      bio: 'Building sustainable technology solutions for a greener future. Former Google engineer with 8 years of experience in developing scalable systems.',
      profileImage: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Marcus Rodriguez',
      email: 'marcus@healthapp.com',
      password: 'password123',
      startupName: 'HealthBridge',
      industry: 'HealthTech',
      fundingStage: 'Series A',
      location: 'Austin, TX',
      bio: 'Democratizing healthcare access through innovative mobile solutions. Medical doctor turned entrepreneur with a passion for improving patient outcomes.',
      profileImage: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Emily Johnson',
      email: 'emily@financeai.com',
      password: 'password123',
      startupName: 'FinanceAI',
      industry: 'FinTech',
      fundingStage: 'Pre-Seed',
      location: 'New York, NY',
      bio: 'Using AI to make personal finance management accessible to everyone. Former Goldman Sachs analyst with expertise in algorithmic trading.',
      profileImage: 'https://images.pexels.com/photos/3586091/pexels-photo-3586091.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'David Kim',
      email: 'david@eduplatform.com',
      password: 'password123',
      startupName: 'LearnTogether',
      industry: 'EdTech',
      fundingStage: 'Seed',
      location: 'Seattle, WA',
      bio: 'Revolutionizing online education with peer-to-peer learning platforms. Former Microsoft product manager with a vision for accessible education.',
      profileImage: 'https://images.pexels.com/photos/2741701/pexels-photo-2741701.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Lisa Park',
      email: 'lisa@foodtech.com',
      password: 'password123',
      startupName: 'FreshFood',
      industry: 'FoodTech',
      fundingStage: 'Series A',
      location: 'Los Angeles, CA',
      bio: 'Connecting local farmers with urban consumers through our innovative supply chain platform. Passionate about sustainable food systems.',
      profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  try {
    await User.deleteMany({});
    const createdUsers = await User.create(users);
    console.log('Users seeded successfully');
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedEvents = async (users) => {
  const events = [
    {
      title: 'Startup Pitch Night',
      description: 'Join us for an evening of innovative startup pitches and networking with fellow entrepreneurs. Great opportunity to showcase your startup and get feedback from experienced founders.',
      date: new Date('2025-02-15'),
      time: '18:00',
      location: 'TechHub San Francisco',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      organizer: users[0]._id,
      attendees: [users[0]._id, users[2]._id, users[3]._id],
      maxAttendees: 50,
      tags: ['Networking', 'Pitching', 'Venture Capital'],
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      title: 'HealthTech Founders Meetup',
      description: 'Monthly gathering for healthcare technology entrepreneurs to share insights and collaborate on solving healthcare challenges.',
      date: new Date('2025-02-18'),
      time: '19:00',
      location: 'Austin Convention Center',
      coordinates: { lat: 30.2672, lng: -97.7431 },
      organizer: users[1]._id,
      attendees: [users[1]._id, users[4]._id],
      maxAttendees: 30,
      tags: ['HealthTech', 'Networking', 'Innovation'],
      image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      title: 'FinTech Summit 2025',
      description: 'Two-day summit featuring the latest trends in financial technology and regulatory updates. Network with industry leaders and investors.',
      date: new Date('2025-03-01'),
      time: '09:00',
      location: 'New York Financial District',
      coordinates: { lat: 40.7074, lng: -74.0113 },
      organizer: users[2]._id,
      attendees: [users[0]._id, users[1]._id, users[2]._id],
      maxAttendees: 200,
      tags: ['FinTech', 'Summit', 'Regulation'],
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  try {
    await Event.deleteMany({});
    await Event.create(events);
    console.log('Events seeded successfully');
  } catch (error) {
    console.error('Error seeding events:', error);
    throw error;
  }
};

const seedMessages = async (users) => {
  const messages = [
    {
      sender: users[1]._id,
      receiver: users[0]._id,
      content: 'Hi Sarah! I saw your EcoTech Solutions profile. Would love to connect and discuss potential collaboration opportunities.',
      read: true
    },
    {
      sender: users[0]._id,
      receiver: users[1]._id,
      content: 'Hi Marcus! Thanks for reaching out. I\'d be interested in learning more about HealthBridge. Are you available for a quick call this week?',
      read: true
    },
    {
      sender: users[1]._id,
      receiver: users[0]._id,
      content: 'Absolutely! I\'m free Thursday afternoon. How does 2 PM PST work for you?',
      read: false
    }
  ];

  try {
    await Message.deleteMany({});
    await Message.create(messages);
    console.log('Messages seeded successfully');
  } catch (error) {
    console.error('Error seeding messages:', error);
    throw error;
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('Seeding database...');
    const users = await seedUsers();
    await seedEvents(users);
    await seedMessages(users);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();