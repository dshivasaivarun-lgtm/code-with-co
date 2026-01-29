// server/controllers/codeController.js
const Code = require('../models/Code');
const Room = require('../models/Room');

// @desc    Save code version
// @route   POST /api/code/save
// @access  Private
exports.saveCode = async (req, res) => {
  try {
    const { roomId, content, language, description } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Get latest version number
    const latestCode = await Code.findOne({ roomId: room._id })
      .sort({ version: -1 });
    
    const version = latestCode ? latestCode.version + 1 : 1;

    const code = await Code.create({
      roomId: room._id,
      content,
      language,
      version,
      description,
      savedBy: req.user._id
    });

    const populatedCode = await Code.findById(code._id)
      .populate('savedBy', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Code saved successfully',
      data: populatedCode
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving code'
    });
  }
};

// @desc    Get code history for a room
// @route   GET /api/code/history/:roomId
// @access  Public/Private
exports.getCodeHistory = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const history = await Code.find({ roomId: room._id })
      .populate('savedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: history
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching code history'
    });
  }
};

// =====================================