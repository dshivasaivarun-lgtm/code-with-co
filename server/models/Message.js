// server/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'code'],
    default: 'text'
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ roomId: 1, createdAt: -1 });

// Auto-populate user info
messageSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'username avatar'
  });
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;