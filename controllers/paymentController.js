const Payment = require('../models/payment');

exports.createFakePayment = async (req, res) => {
  try {
    const { amount, propertyId } = req.body;

    if (!amount || !propertyId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const payment = await Payment.create({
      amount,
      propertyId,
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Fake payment intent created successfully',
      clientSecret: 'pi_fake_' + Date.now(),
      paymentId: payment._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Payment creation failed', error: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).populate('propertyId');
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
};
