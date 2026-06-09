const express = require('express');
const multer = require('multer');
const { storage: cloudinaryStorage } = require('../config/cloudinary');
const authController = require('../controllers/authController');

const router = express.Router();

// Use Cloudinary storage for persistent image hosting
const upload = multer({
  storage: cloudinaryStorage,
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

const { validateRegister, validateLogin } = require('../middleware/validation');

// Register with file upload support
router.post('/register', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'businessLogo', maxCount: 1 },
  { name: 'retailerPhoto', maxCount: 1 },
  { name: 'storefrontPhoto', maxCount: 1 }
]), validateRegister, authController.register);

// Login Route
router.post('/login', validateLogin, authController.login);

module.exports = router;
