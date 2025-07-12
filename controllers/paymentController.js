const Payment = require('../models/payment');

// Create fake payment intent
exports.createFakePaymentIntent = async (req, res) => {
  try {
    const { amount, propertyId } = req.body;
    const tenantId = req.user.id;

    if (!amount || !propertyId) {
      return res.status(400).json({ message: 'Amount and propertyId are required' });
    }

    const clientSecret = `pi_fake_${Date.now()}`;

    const payment = await Payment.create({
      tenant: tenantId,
      property: propertyId,
      amount,
      clientSecret,
      status: 'pending'
    });

    res.status(200).json({
      message: 'Fake payment intent created successfully',
      clientSecret,
      paymentId: payment._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment intent', error: err.message });
  }
};

// Confirm fake payment
exports.confirmFakePayment = async (req, res) => {
  try {
    const { clientSecret } = req.body;

    const payment = await Payment.findOne({ clientSecret });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'confirmed';
    await payment.save();

    res.status(200).json({
      message: 'Payment confirmed successfully',
      paymentId: payment._id,
      status: payment.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to confirm payment', error: err.message });
  }
};

// In controllers/paymentController.js
exports.getAllPayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payments = await Payment.find()
      .populate('tenant', 'name email')
      .populate('property', 'title location');

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get payments', error: err.message });
  }
};
//tenant view
exports.getTenantPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ tenant: req.user.id })
      .populate('property', 'title location');

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get your payments', error: err.message });
  }
};
//landlord view
exports.getLandlordPropertyPayments = async (req, res) => {
  try {
    const landlordId = req.user.id;

    const payments = await Payment.find()
      .populate({
        path: 'property',
        match: { createdBy: landlordId }, // Filter only landlord’s properties
        select: 'title location'
      })
      .populate('tenant', 'name email');

    const filtered = payments.filter(p => p.property); // Remove nulls if property doesn't match

    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get payments', error: err.message });
  }
};
