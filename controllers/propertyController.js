const Property = require('../models/property');

// Create a new property (with optional image)
exports.createProperty = async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can create properties' });
    }

    const { title, description, price, address, latitude, longitude } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !price || !address || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const property = await Property.create({
      title,
      description,
      price,
      address,
      image,
      createdBy: req.user._id || req.user.id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update property by ID
exports.updateProperty = async (req, res) => {
  try {
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete property by ID
exports.deleteProperty = async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 🔍 Get nearby properties
// controllers/propertyController.js

exports.getNearbyProperties = async (req, res) => {
  try {
    const { lat, lng, distance = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Missing coordinates' });
    }

    const properties = await Property.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(distance)
        }
      }
    });

    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Geo search failed', error: err.message });
  }
};

// controllers/propertyController.js

exports.getAllProperties = async (req, res) => {
  try {
    const { minPrice, maxPrice, bedrooms, location, type } = req.query;

    const filter = {};

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (bedrooms) {
      filter.bedrooms = Number(bedrooms);
    }

    if (type) {
      filter.type = type; // e.g. "Apartment", "Flat", etc.
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' }; // partial match
    }

    const properties = await Property.find(filter);
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

