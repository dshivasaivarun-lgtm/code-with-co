// server/routes/room.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  updateRoom,
  deleteRoom,
  deleteAllRooms
} = require('../controllers/roomController');

// Public routes
router.get('/', getRooms);
router.get('/:roomId', getRoomById);

// Protected routes
router.post('/', protect, createRoom);
router.post('/:roomId/join', protect, joinRoom);
router.post('/:roomId/leave', protect, leaveRoom);
router.put('/:roomId', protect, updateRoom);
router.delete('/:roomId', protect, deleteRoom);
router.delete('/admin/all', protect, deleteAllRooms);

module.exports = router;