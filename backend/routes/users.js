const express = require('express');
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Apply auth middleware to all user routes
router.use(auth);

// --- Place all specific routes BEFORE parameterized routes ---

// Get all users with status (for retailers)
router.get('/with-status', userController.getUsersWithStatus);

// Get interested customers for a retailer
router.get('/interested-customers', userController.getInterestedCustomers);

// Get followed retailers for a customer
router.get('/followed-retailers', userController.getFollowedRetailers);

// Unfollow a retailer
router.post('/unfollow', userController.unfollowRetailer);

const { validateLocation } = require('../middleware/validation');

// Update user location
router.post('/update-location', validateLocation, userController.updateLocation);

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
router.put('/:id', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'businessLogo', maxCount: 1 },
  { name: 'retailerPhoto', maxCount: 1 },
  { name: 'storefrontPhoto', maxCount: 1 }
]), userController.updateUserProfile);

// Get user by ID (any role)
router.get('/:id', userController.getUserById);

module.exports = router;
