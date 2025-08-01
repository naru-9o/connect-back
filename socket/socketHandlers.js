import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

// Store active users
const activeUsers = new Map();

export const handleConnection = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected`);
    
    // Add user to active users
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user
    });

    // Join user to their own room
    socket.join(socket.userId);

    // Broadcast user online status
    socket.broadcast.emit('userOnline', {
      userId: socket.userId,
      user: {
        _id: socket.user._id,
        name: socket.user.name,
        profileImage: socket.user.profileImage
      }
    });

    // Handle joining conversation rooms
    socket.on('joinConversation', (otherUserId) => {
      const roomId = [socket.userId, otherUserId].sort().join('-');
      socket.join(roomId);
      console.log(`User ${socket.user.name} joined conversation room: ${roomId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leaveConversation', (otherUserId) => {
      const roomId = [socket.userId, otherUserId].sort().join('-');
      socket.leave(roomId);
      console.log(`User ${socket.user.name} left conversation room: ${roomId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, content } = data;

        // Validate input
        if (!receiverId || !content || content.trim().length === 0) {
          socket.emit('messageError', { message: 'Invalid message data' });
          return;
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          socket.emit('messageError', { message: 'Receiver not found' });
          return;
        }

        // Create message in database
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim()
        });

        // Populate sender and receiver info
        await message.populate('sender', 'name profileImage');
        await message.populate('receiver', 'name profileImage');

        // Send to conversation room
        const roomId = [socket.userId, receiverId].sort().join('-');
        io.to(roomId).emit('newMessage', message);

        // Send to receiver's personal room (for notifications)
        io.to(receiverId).emit('messageNotification', {
          message,
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
            profileImage: socket.user.profileImage
          }
        });

        console.log(`Message sent from ${socket.user.name} to ${receiver.name}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('messageError', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const roomId = [socket.userId, receiverId].sort().join('-');
      
      socket.to(roomId).emit('userTyping', {
        userId: socket.userId,
        user: {
          _id: socket.user._id,
          name: socket.user.name
        },
        isTyping
      });
    });

    // Handle marking messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { senderId } = data;
        
        await Message.updateMany(
          {
            sender: senderId,
            receiver: socket.userId,
            read: false
          },
          {
            read: true,
            readAt: new Date()
          }
        );

        // Notify sender that messages were read
        io.to(senderId).emit('messagesRead', {
          readBy: socket.userId
        });
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
      
      // Remove from active users
      activeUsers.delete(socket.userId);

      // Broadcast user offline status
      socket.broadcast.emit('userOffline', {
        userId: socket.userId
      });

      // Update last seen in database
      User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() }).exec();
    });
  });
};

// Get active users
export const getActiveUsers = () => {
  return Array.from(activeUsers.values()).map(({ user }) => ({
    _id: user._id,
    name: user.name,
    profileImage: user.profileImage
  }));
};