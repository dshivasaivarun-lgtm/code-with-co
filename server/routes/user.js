// server/routes/user.js
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  searchUsers
} = require('../controllers/userController');

router.get('/search', searchUsers);
router.get('/:username', getUserProfile);

module.exports = router;