const router = require('express').Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, sendMessage);
router.get('/', authMiddleware, getMessages);

module.exports = router;
