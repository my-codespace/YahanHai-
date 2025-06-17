const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

// --- Place all specific routes BEFORE parameterized routes ---

// Get all users with status (for retailers)
router.get('/with-status', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get interested customers for a retailer
router.get('/interested-customers', async (req, res) => {
  const { retailerId } = req.query;
  if (!retailerId) return res.status(400).json({ msg: 'Missing retailerId' });
  if (!mongoose.Types.ObjectId.isValid(retailerId)) {
    return res.status(400).json({ msg: 'Invalid retailerId' });
  }

  try {
    console.log('Fetching interested customers for retailer:', retailerId);
    const customers = await User.find({
      role: 'customer',
      followedRetailers: new mongoose.Types.ObjectId(retailerId),
      location: { $exists: true },
    }).select('-password');

    console.log('Found customers:', customers.length);
    res.json(customers.map(c => ({
      id: c._id,
      name: c.name,
      profilePic: c.profilePic,
      city: c.city,
      interest: c.interest,
      lat: c.location.lat,
      lng: c.location.lng,
    })));
  } catch (err) {
    console.error('Error in /interested-customers:', err.message, err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Unfollow a retailer
router.post('/unfollow', async (req, res) => {
  const { customerId, retailerId } = req.body;
  if (!customerId || !retailerId) return res.status(400).json({ msg: 'Missing data' });
  try {
    await User.findByIdAndUpdate(customerId, { $pull: { followedRetailers: retailerId } });
    res.json({ msg: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update user location
router.post('/update-location', async (req, res) => {
  const { userId, lat, lng } = req.body;
  if (!userId || lat === undefined || lng === undefined) {
    return res.status(400).json({ msg: 'Missing data' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { location: { lat, lng } },
      { new: true }
    ).select("-password");
    if (req.io) req.io.emit("location-update", user);
    res.json({ msg: 'Location updated', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Follow a retailer
router.post('/follow', async (req, res) => {
  const { customerId, retailerId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(customerId) || !mongoose.Types.ObjectId.isValid(retailerId)) {
    return res.status(400).json({ msg: 'Invalid customerId or retailerId' });
  }
  try {
    await User.findByIdAndUpdate(
      customerId,
      { $addToSet: { followedRetailers: new mongoose.Types.ObjectId(retailerId) } },
      { new: true }
    );
    res.json({ msg: 'Followed successfully' });
  } catch (err) {
    console.error('Error in /follow:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get nearby retailers (with all info)
router.get('/retailers', async (req, res) => {
  const { lat, lng, radius = 2000 } = req.query;
  if (!lat || !lng) return res.status(400).json({ msg: 'Missing coordinates' });

  const retailers = await User.find({
    role: 'retailer',
    location: { $exists: true },
  }).select('-password');

  const toRad = (value) => (value * Math.PI) / 180;
  const filtered = retailers.filter((retailer) => {
    if (!retailer.location?.lat || !retailer.location?.lng) return false;
    const R = 6371000;
    const dLat = toRad(retailer.location.lat - lat);
    const dLng = toRad(retailer.location.lng - lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) *
      Math.cos(toRad(retailer.location.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c) <= radius;
  });

  res.json(filtered.map(r => ({
    id: r._id,
    name: r.name,
    shopName: r.shopName,
    businessCategory: r.businessCategory,
    businessDescription: r.businessDescription,
    businessLogo: r.businessLogo,
    retailerPhoto: r.retailerPhoto,
    operatingHours: r.operatingHours,
    deliveryAvailable: r.deliveryAvailable,
    phone: r.phone,
    lat: r.location.lat,
    lng: r.location.lng,
  })));
});

// Get nearby customers (with all info)
router.get('/customers', async (req, res) => {
  const { lat, lng, radius = 2000 } = req.query;
  if (!lat || !lng) return res.status(400).json({ msg: 'Missing coordinates' });

  const customers = await User.find({
    role: 'customer',
    location: { $exists: true },
  }).select('-password');

  const toRad = (value) => (value * Math.PI) / 180;
  const filtered = customers.filter((customer) => {
    if (!customer.location?.lat || !customer.location?.lng) return false;
    const R = 6371000;
    const dLat = toRad(customer.location.lat - lat);
    const dLng = toRad(customer.location.lng - lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) *
      Math.cos(toRad(customer.location.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c) <= radius;
  });

  res.json(filtered.map(c => ({
    id: c._id,
    name: c.name,
    profilePic: c.profilePic,
    city: c.city,
    interest: c.interest,
    lat: c.location.lat,
    lng: c.location.lng,
  })));
});

// Get online users
router.get('/online', async (req, res) => {
  try {
    const role = req.query.role;
    const filter = {
      "location.lat": { $exists: true, $ne: null },
      "location.lng": { $exists: true, $ne: null }
    };
    if (role) filter.role = role;
    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// --- Parameterized routes LAST ---

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // For security, remove fields that should not be updated by the user
    delete updateData.role;
    delete updateData._id;
    delete updateData.password;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get user by ID (any role)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
