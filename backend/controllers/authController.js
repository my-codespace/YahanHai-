const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
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
      name, email, password, phone, role
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

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ token, role: user.role, user: userResponse });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
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
    console.error('Login Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
