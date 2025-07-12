// paymentRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  createFakePaymentIntent,
  getAllPayments,
  getTenantPayments,
  getLandlordPropertyPayments
} = require('../controllers/paymentController'); // ✅ Ensure all needed methods are imported

// Routes
router.post('/create-intent', authMiddleware, createFakePaymentIntent);

// Admin: Get all payments
router.get('/', authMiddleware, getAllPayments);

// Tenant: View their own payments
router.get('/my', authMiddleware, getTenantPayments);

// Landlord: View payments for their properties
router.get('/landlord', authMiddleware, getLandlordPropertyPayments);

module.exports = router;
