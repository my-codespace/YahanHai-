const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const RetailerProfile = require('../models/RetailerProfile');
const UserLocation = require('../models/UserLocation');
const Follow = require('../models/Follow');
const parseOperatingHours = require('../utils/parseOperatingHours');

const getPopulatedUserResponse = async (user) => {
  const userObj = user.toObject();
  delete userObj.password;

  if (user.role === 'customer') {
    const profile = await CustomerProfile.findOne({ userId: user._id });
    if (profile) Object.assign(userObj, profile.toObject(), { _id: user._id });
    const follows = await Follow.find({ customerId: user._id }).select('retailerId');
    userObj.followedRetailers = follows.map(f => f.retailerId.toString());
  } else {
    const profile = await RetailerProfile.findOne({ userId: user._id });
    if (profile) Object.assign(userObj, profile.toObject(), { _id: user._id });
  }

  const userLocation = await UserLocation.findOne({ userId: user._id });
  if (userLocation && userLocation.location && userLocation.location.coordinates) {
    userObj.location = {
      lng: userLocation.location.coordinates[0],
      lat: userLocation.location.coordinates[1]
    };
    userObj.isOnline = userLocation.isOnline;
    userObj.lastSeen = userLocation.lastSeen;
  }
  return userObj;
};

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

    const userResponse = await getPopulatedUserResponse(user);
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

    const userResponse = await getPopulatedUserResponse(user);

    res.json({ token, role: user.role, user: userResponse });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
