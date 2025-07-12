const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { sendMessage, getConversations } = require('../controllers/messageController');

// Send message
router.post('/', authMiddleware, sendMessage);

// Get messages
router.get('/', authMiddleware, getConversations);

module.exports = router;
