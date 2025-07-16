// routes/adminRoutes.js

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const adminController = require('../controllers/adminController');

// Protect all routes with auth + admin
router.use(authMiddleware, requireAdmin);

// Admin user routes
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// Admin property routes
router.get('/properties', adminController.getAllProperties);
router.delete('/properties/:id', adminController.deleteProperty);

// --- New Analytics Route ---
router.get('/analytics', adminController.getPlatformAnalytics);


module.exports = router;
