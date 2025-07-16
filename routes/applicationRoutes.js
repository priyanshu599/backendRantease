const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const Property = require('../models/property');
const authMiddleware = require('../middleware/authMiddleware');

// Tenant applies to a property
// In your backend's routes/applicationRoutes.js file

router.post('/:propertyId/apply', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can apply' });
    }
    const { propertyId } = req.params;
    const { message } = req.body;

    const existingApplication = await Application.findOne({ property: propertyId, tenant: req.user.id });

    if (existingApplication) {
      // If application is pending or approved, they can't apply again.
      if (existingApplication.status === 'pending' || existingApplication.status === 'approved') {
        return res.status(400).json({ message: 'You already have an active application for this property' });
      }

      // If it's rejected, allow re-application by updating the existing one.
      if (existingApplication.status === 'rejected') {
        existingApplication.status = 'pending';
        existingApplication.message = message;
        existingApplication.createdAt = new Date(); // Update timestamp
        await existingApplication.save();
        return res.status(200).json({ message: 'Your application has been re-submitted successfully.', application: existingApplication });
      }
    }

    // If no application exists, create a new one.
    const application = await Application.create({
      property: propertyId,
      tenant: req.user.id,
      message
    });
    res.status(201).json({ message: 'Application submitted successfully!', application });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Landlord views applications for their property
router.get('/property/:propertyId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can view applications' });
    }

    const property = await Property.findOne({ _id: req.params.propertyId, createdBy: req.user.id });
    if (!property) return res.status(403).json({ message: 'Not your property' });

    const applications = await Application.find({ property: req.params.propertyId })
      .populate('tenant', 'name email');

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve application (Landlord only)
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can approve applications' });
    }

    const application = await Application.findById(req.params.id).populate('property');
    if (!application || application.property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to approve this application' });
    }

    application.status = 'approved';
    await application.save();

    res.status(200).json({ message: 'Application approved', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reject application (Landlord only)
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can reject applications' });
    }

    const application = await Application.findById(req.params.id).populate('property');
    if (!application || application.property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to reject this application' });
    }

    application.status = 'rejected';
    await application.save();

    res.status(200).json({ message: 'Application rejected', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Tenant views all their applications
router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can view their applications' });
    }

    const applications = await Application.find({ tenant: req.user.id })
      .populate('property', 'title address price')  // Optional: adjust based on your schema

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Tenant views a specific application
router.get('/my-applications/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can view applications' });
    }

    const application = await Application.findOne({ _id: req.params.id, tenant: req.user.id })
      .populate('property', 'title address');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// new route for when a application got rejected 
router.get('/status/:propertyId', authMiddleware, async (req, res) => {
    try {
        const application = await Application.findOne({
            property: req.params.propertyId,
            tenant: req.user.id
        });

        if (!application) {
            return res.status(404).json({ message: 'No application found' });
        }

        res.status(200).json({ status: application.status });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
