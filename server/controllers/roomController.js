// server/controllers/roomController.js
const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    console.log('Create room request:', req.body);
    console.log('User:', req.user);
    const { name, description, language, isPublic, password, maxParticipants } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Room name is required'
      });
    }

    const room = await Room.create({
      name,
      description,
      language: language || 'javascript',
      isPublic: isPublic !== false,
      password,
      maxParticipants: maxParticipants || 10,
      createdBy: req.user._id,
      participants: [{
        user: req.user._id,
        isActive: true
      }]
    });

    // Add room to user's rooms
    await User.findByIdAndUpdate(req.user._id, {
      $push: { rooms: room._id }
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: populatedRoom
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating room'
    });
  }
};

// @desc    Get all public rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, language } = req.query;

    const query = { isPublic: true, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (language) {
      query.language = language;
    }

    const rooms = await Room.find(query)
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar')
      .sort({ lastActivityAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Room.countDocuments(query);

    res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalRooms: count
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms'
    });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:roomId
// @access  Public/Private
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room'
    });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/:roomId/join
// @access  Private
exports.joinRoom = async (req, res) => {
  try {
    const { password } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room is full
    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }

    // Check password for private rooms
    if (!room.isPublic && room.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Add participant if not already in room
    await room.addParticipant(req.user._id);
    await room.updateActivity();

    // Add room to user's rooms
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { rooms: room._id }
    });

    const updatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar');

    res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      data: updatedRoom
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error joining room'
    });
  }
};

// @desc    Leave a room
// @route   POST /api/rooms/:roomId/leave
// @access  Private
exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await room.removeParticipant(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Left room successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving room'
    });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:roomId
// @access  Private (creator only)
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is the creator
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this room'
      });
    }

    const { name, description, language, isPublic, maxParticipants } = req.body;

    if (name) room.name = name;
    if (description !== undefined) room.description = description;
    if (language) room.language = language;
    if (isPublic !== undefined) room.isPublic = isPublic;
    if (maxParticipants) room.maxParticipants = maxParticipants;

    await room.save();

    const updatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar');

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room'
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:roomId
// @access  Private (creator only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this room'
      });
    }

    room.isActive = false;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting room'
    });
  }
};

// @desc    Delete all rooms (admin)
// @route   DELETE /api/rooms/admin/all
// @access  Private
exports.deleteAllRooms = async (req, res) => {
  try {
    await Room.deleteMany({});
    res.status(200).json({
      success: true,
      message: 'All rooms deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting rooms'
    });
  }
};