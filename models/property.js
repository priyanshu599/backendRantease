const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  image: {
  type: String, // will store image file path or URL
  default: ''
},
createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  

}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
