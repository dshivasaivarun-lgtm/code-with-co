const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  saveCode,
  getCodeHistory
} = require('../controllers/codeController');

router.post('/save', protect, saveCode);
router.get('/history/:roomId', getCodeHistory);

module.exports = router;
