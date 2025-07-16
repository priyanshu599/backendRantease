// controllers/bookingController.js
const Booking = require('../models/booking');
const Property = require('../models/property');

// Create a new booking request
exports.createBooking = async (req, res) => {
  try {
    const { propertyId, startDate, endDate, totalPrice } = req.body;
    const tenantId = req.user.id;

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      property: propertyId,
      status: 'confirmed',
      $or: [
        { startDate: { $lt: endDate, $gte: startDate } },
        { endDate: { $gt: startDate, $lte: endDate } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Property is not available for the selected dates.' });
    }

    const booking = await Booking.create({
      property: propertyId,
      tenant: tenantId,
      startDate,
      endDate,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all bookings for the logged-in tenant
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user.id })
      .populate('property', 'title address image')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all bookings for a specific property (for landlord)
exports.getBookingsForProperty = async (req, res) => {
  try {
    const bookings = await Booking.find({ property: req.params.propertyId })
      .populate('tenant', 'name email')
      .sort({ startDate: 1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update booking status (confirm/cancel by landlord)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.bookingId).populate('property');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the person updating is the property owner
    if (booking.property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get all confirmed booking dates for a property
exports.getConfirmedBookingDates = async (req, res) => {
  try {
    const bookings = await Booking.find({
      property: req.params.propertyId,
      status: 'confirmed'
    }, 'startDate endDate'); // Only select start and end dates

    const disabledDates = bookings.reduce((acc, booking) => {
      let currentDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      while (currentDate <= endDate) {
        acc.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return acc;
    }, []);

    res.status(200).json(disabledDates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};