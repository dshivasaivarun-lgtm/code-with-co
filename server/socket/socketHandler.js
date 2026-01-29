// server/socket/socketHandler.js
const Room = require('../models/Room');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store active users per room
const activeUsers = new Map();

module.exports = (io) => {
  
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

    // JOIN ROOM
    socket.on('join-room', async ({ roomId }) => {
      try {
        const room = await Room.findOne({ roomId })
          .populate('participants.user', 'username avatar');

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Join socket room
        socket.join(roomId);
        socket.currentRoom = roomId;

        // Track active users
        if (!activeUsers.has(roomId)) {
          activeUsers.set(roomId, new Map());
        }
        activeUsers.get(roomId).set(socket.user._id.toString(), {
          socketId: socket.id,
          username: socket.user.username,
          avatar: socket.user.avatar,
          userId: socket.user._id
        });

        // Update room activity
        await room.updateActivity();

        // Send current room state to the user
        socket.emit('room-joined', {
          room: {
            roomId: room.roomId,
            name: room.name,
            language: room.language,
            currentCode: room.currentCode,
            participants: room.participants
          },
          activeUsers: Array.from(activeUsers.get(roomId).values())
        });

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar,
          activeUsers: Array.from(activeUsers.get(roomId).values())
        });

        console.log(`${socket.user.username} joined room: ${roomId}`);

      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // CODE CHANGE
    socket.on('code-change', async ({ roomId, code, cursorPosition }) => {
      try {
        // Update room's current code
        await Room.findOneAndUpdate(
          { roomId },
          { 
            currentCode: code,
            lastActivityAt: Date.now()
          }
        );

        // Broadcast to others in the room (except sender)
        socket.to(roomId).emit('code-update', {
          code,
          userId: socket.user._id,
          username: socket.user.username,
          cursorPosition
        });

      } catch (error) {
        console.error('Code change error:', error);
      }
    });

    // LANGUAGE CHANGE
    socket.on('language-change', async ({ roomId, language }) => {
      try {
        const room = await Room.findOneAndUpdate(
          { roomId },
          { language },
          { new: true }
        );

        // Broadcast to everyone in the room
        io.to(roomId).emit('language-updated', {
          language,
          userId: socket.user._id,
          username: socket.user.username
        });

      } catch (error) {
        console.error('Language change error:', error);
      }
    });

    // CURSOR POSITION
    socket.on('cursor-move', ({ roomId, position }) => {
      socket.to(roomId).emit('cursor-update', {
        userId: socket.user._id,
        username: socket.user.username,
        position
      });
    });

    // CHAT MESSAGE
    socket.on('send-message', async ({ roomId, message }) => {
      console.log(`📨 Message received from ${socket.user.username}:`, { roomId, message });
      try {
        // Find room first
        const room = await Room.findOne({ roomId });
        if (!room) {
          console.log('❌ Room not found:', roomId);
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        console.log('✅ Room found:', room.name);

        // Save message to database
        const newMessage = await Message.create({
          roomId: room._id,
          user: socket.user._id,
          message,
          messageType: 'text'
        });

        console.log('💾 Message saved to DB:', newMessage._id);

        const populatedMessage = await Message.findById(newMessage._id)
          .populate('user', 'username avatar');

        console.log('📤 Broadcasting message to room:', roomId);
        console.log('Message data:', populatedMessage);

        // Broadcast to everyone in the room
        io.to(roomId).emit('new-message', populatedMessage);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // TYPING INDICATOR
    socket.on('typing-start', ({ roomId }) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('user-stopped-typing', {
        userId: socket.user._id
      });
    });

    // USER LEAVING ROOM
    socket.on('leave-room', async ({ roomId }) => {
      handleUserLeave(socket, roomId);
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.username}`);
      
      if (socket.currentRoom) {
        handleUserLeave(socket, socket.currentRoom);
      }
    });

    // Helper function to handle user leaving
    const handleUserLeave = (socket, roomId) => {
      socket.leave(roomId);

      // Remove from active users
      if (activeUsers.has(roomId)) {
        activeUsers.get(roomId).delete(socket.user._id.toString());
        
        // If no users left in room, clean up
        if (activeUsers.get(roomId).size === 0) {
          activeUsers.delete(roomId);
        }

        // Notify others
        socket.to(roomId).emit('user-left', {
          userId: socket.user._id,
          username: socket.user.username,
          activeUsers: activeUsers.has(roomId) 
            ? Array.from(activeUsers.get(roomId).values()) 
            : []
        });
      }

      console.log(`${socket.user.username} left room: ${roomId}`);
    };
  });
};