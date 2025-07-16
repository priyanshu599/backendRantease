const router = require('express').Router();
const { createFakePayment, getAllPayments } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createFakePayment);
router.get('/', authMiddleware, getAllPayments);

module.exports = router;
