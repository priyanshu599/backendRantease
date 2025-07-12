const express = require('express');
const router = express.Router();
const Property = require('../models/property');
const authMiddleware = require('../middleware/authMiddleware'); // You should already have this

// POST /api/properties — Create a new property (Only for landlords)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can create properties' });
    }

    const { title, description, price, location } = req.body;

    if (!title || !price || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const property = new Property({
      title,
      description,
      price,
      location,
      createdBy: req.user.id // 👈 Here we link property to the user
    });

    await property.save();

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
module.exports = router;
