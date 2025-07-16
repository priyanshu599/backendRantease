const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: Number,
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'success' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
