const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  address: { type: String },

  // GeoJSON Location field for geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // Format: [longitude, latitude]
      required: true
    }
  },

  image: { type: String },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Geospatial Index for location field
propertySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);
