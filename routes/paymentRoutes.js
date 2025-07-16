// routes/paymentRoutes.js
const router = require('express').Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/order', authMiddleware, createRazorpayOrder);
router.post('/verify', authMiddleware, verifyPayment);

module.exports = router;
