const express = require('express');
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    // Create unique filename
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Register with file upload support
router.post('/register', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'businessLogo', maxCount: 1 },
  { name: 'retailerPhoto', maxCount: 1 }
]), authController.register);

// Login Route
router.post('/login', authController.login);

module.exports = router;
