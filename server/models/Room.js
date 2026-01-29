// server/models/Room.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(6).toString('hex')
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  currentCode: {
    type: String,
    default: '// Start coding together!\n\n'
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'typescript', 'html', 'css'],
    default: 'javascript'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  password: {
    type: String,
    select: false
  },
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
roomSchema.index({ roomId: 1 });
roomSchema.index({ createdBy: 1 });
roomSchema.index({ isPublic: 1, isActive: 1 });

// Update last activity
roomSchema.methods.updateActivity = function() {
  this.lastActivityAt = Date.now();
  return this.save();
};

// Add participant
roomSchema.methods.addParticipant = function(userId) {
  const exists = this.participants.some(p => p.user.toString() === userId.toString());
  if (!exists && this.participants.length < this.maxParticipants) {
    this.participants.push({ user: userId });
  }
  return this.save();
};

// Remove participant
roomSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  return this.save();
};

// Get active participants count
roomSchema.virtual('activeParticipantsCount').get(function() {
  return this.participants.filter(p => p.isActive).length;
});

module.exports = mongoose.model('Room', roomSchema);