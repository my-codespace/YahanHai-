const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const RetailerProfile = require('../models/RetailerProfile');
const UserLocation = require('../models/UserLocation');
const parseOperatingHours = require('../utils/parseOperatingHours');

exports.register = async (req, res) => {
  try {
    const { 
      name, email, password, phone, role, 
      // Customer fields (we map what we can)
      interest, dob, city,
      // Retailer fields
      shopName, businessCategory, businessDescription, 
      gstin, operatingHours, deliveryAvailable 
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Create user base
    user = new User({ name, email, phone, role });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Create location entry
    await UserLocation.create({ userId: user._id, role: user.role });

    // Add role-specific profile
    if (role === 'customer') {
      const profileData = { userId: user._id };
      if (req.files && req.files.profilePic) {
        profileData.profilePic = req.files.profilePic[0].path;
      }
      // If city is provided, we can optionally save it as a saved address, but let's keep it simple
      await CustomerProfile.create(profileData);
    }

    if (role === 'retailer') {
      const profileData = {
        userId: user._id,
        shopName,
        businessCategory: businessCategory || 'General',
        businessDescription,
        gstin,
        deliveryAvailable: deliveryAvailable === 'true'
      };
      
      if (operatingHours) {
        profileData.operatingHours = parseOperatingHours(operatingHours);
      }
      
      // Handle file uploads
      if (req.files && req.files.businessLogo) {
        profileData.businessLogo = req.files.businessLogo[0].path;
      }
      if (req.files && req.files.retailerPhoto) {
        profileData.ownerPhoto = req.files.retailerPhoto[0].path;
      }
      if (req.files && req.files.storefrontPhoto) {
        profileData.storefrontPhoto = req.files.storefrontPhoto[0].path;
      }
      
      await RetailerProfile.create(profileData);
    }

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
