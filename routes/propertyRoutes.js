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
const upload = require('../middleware/uploadMiddleware');
const Property = require('../models/property');
const { getNearbyProperties, ...otherControllers } = require('../controllers/propertyController');

// ✅ Create property with image upload (Only for landlords)
router.post(
  '/',
  authMiddleware,
  upload.single('image'), // must match the key used in Postman
  createProperty
);

// ✅ Get all properties (Admin, Tenant, Landlord)
router.get('/', getAllProperties);

// ✅ Get properties created by the logged-in landlord
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
router.get('/:id', getPropertyById);

// ✅ Update property by ID
router.put('/:id', authMiddleware, updateProperty);

// ✅ Delete property by ID
router.delete('/:id', authMiddleware, deleteProperty);

// 🔍 Get nearby properties by location (lat, lng, radius in km)
router.get('/nearby', authMiddleware, getNearbyProperties);



module.exports = router;
