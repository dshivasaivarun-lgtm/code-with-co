// server/models/Code.js
const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});



const Code = mongoose.model('Code', codeSchema);

module.exports = Code;