const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// --- Place all specific routes BEFORE parameterized routes ---

// Get all users with status (for retailers)
router.get('/with-status', userController.getUsersWithStatus);

// Get interested customers for a retailer
router.get('/interested-customers', userController.getInterestedCustomers);

// Unfollow a retailer
router.post('/unfollow', userController.unfollowRetailer);

// Update user location
router.post('/update-location', userController.updateLocation);

// Follow a retailer
router.post('/follow', userController.followRetailer);

// Get nearby retailers (with all info)
router.get('/retailers', userController.getNearbyRetailers);

// Get nearby customers (with all info)
router.get('/customers', userController.getNearbyCustomers);

// Get online users
router.get('/online', userController.getOnlineUsers);

// --- Parameterized routes LAST ---

// Update user profile
router.put('/:id', userController.updateUserProfile);

// Get user by ID (any role)
router.get('/:id', userController.getUserById);

module.exports = router;
