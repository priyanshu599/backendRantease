const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  address: String,

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  image: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Add geospatial index
propertySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);
