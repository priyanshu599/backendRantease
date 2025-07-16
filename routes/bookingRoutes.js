// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createBooking,
  getMyBookings,
  getBookingsForProperty,
  updateBookingStatus,
  getConfirmedBookingDates
} = require('../controllers/bookingController');

// Tenant creates a booking request
router.post('/', authMiddleware, createBooking);

// Tenant gets their own bookings
router.get('/my-bookings', authMiddleware, getMyBookings);

// Landlord gets bookings for one of their properties
router.get('/property/:propertyId', authMiddleware, getBookingsForProperty);

// Landlord updates a booking status (e.g., confirm or cancel)
router.put('/:bookingId', authMiddleware, updateBookingStatus);

// Get all confirmed booking dates for a property
router.get('/property/:propertyId/dates', getConfirmedBookingDates);

module.exports = router;
