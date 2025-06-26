const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// **NEW: Configure Multer for file uploads**
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

// **UPDATED: Register with file upload support**
router.post('/register', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'businessLogo', maxCount: 1 },
  { name: 'retailerPhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    
    const { 
      name, email, password, phone, role, 
      // Customer fields
      interest, dob, city,
      // Retailer fields
      shopName, businessCategory, businessDescription, 
      gstin, operatingHours, deliveryAvailable 
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      phone,
      role
    };

    // Add role-specific fields
    if (role === 'customer') {
      userData.interest = interest;
      userData.dob = dob;
      userData.city = city;
      // Handle profile pic upload
      if (req.files && req.files.profilePic) {
        userData.profilePic = req.files.profilePic[0].path;
      }
    }

    if (role === 'retailer') {
      userData.shopName = shopName;
      userData.businessCategory = businessCategory;
      userData.businessDescription = businessDescription;
      userData.gstin = gstin;
      userData.operatingHours = operatingHours;
      userData.deliveryAvailable = deliveryAvailable === 'true';
      
      // Handle file uploads
      if (req.files && req.files.businessLogo) {
        userData.businessLogo = req.files.businessLogo[0].path;
      }
      if (req.files && req.files.retailerPhoto) {
        userData.retailerPhoto = req.files.retailerPhoto[0].path;
      }
    }

    // Create user
    user = new User(userData);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT token
    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    const userResponse = user.toObject(); // Convert Mongoose doc to plain JS object
    delete userResponse.password; // Remove password before sending
    res.json({ token, role: user.role, user: userResponse });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login Route (unchanged)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  
      const payload = { userId: user.id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({ token, role: user.role, user: userResponse });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
});

module.exports = router;
