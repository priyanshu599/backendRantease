const Application = require('../models/application');

exports.applyToProperty = async (req, res) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can apply to properties' });
    }

    const { propertyId } = req.params;

    const existingApplication = await Application.findOne({
      property: propertyId,
      tenant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this property' });
    }

    const application = await Application.create({
      property: propertyId,
      tenant: req.user.id
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
