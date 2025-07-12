const express = require('express');
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');

const authMiddleware = require('../middleware/authMiddleware');
const Property = require('../models/property');

// ✅ Create a new property (Only for landlords)
router.post('/', authMiddleware, createProperty);

// ✅ Get all properties (Admin, Tenant, Landlord can view all)
router.get('/', authMiddleware, getAllProperties);

// ✅ Get properties created by logged-in landlord only
router.get('/my', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can view their own properties' });
    }

    const properties = await Property.find({ createdBy: req.user.id });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Get property by ID
router.get('/:id', authMiddleware, getPropertyById);

// ✅ Update property by ID (optionally restrict to landlords if needed)
router.put('/:id', authMiddleware, updateProperty);

// ✅ Delete property by ID (optionally restrict to landlords if needed)
router.delete('/:id', authMiddleware, deleteProperty);

module.exports = router;
