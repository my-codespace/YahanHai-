const express = require('express');
const User = require('../models/User');
const router = express.Router();

// --- User Profile Routes ---

// Get user profile (all fields except password)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update user profile (all fields except password)
router.put('/:id', async (req, res) => {
  const updateData = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// --- Location & Following ---

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

    // Use req.io to broadcast location update
    if (req.io) req.io.emit("location-update", user);

    res.json({ msg: 'Location updated', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});



// Follow a retailer
router.post('/follow', async (req, res) => {
  const { customerId, retailerId } = req.body;
  if (!customerId || !retailerId) return res.status(400).json({ msg: 'Missing data' });
  try {
    await User.findByIdAndUpdate(customerId, { $addToSet: { followedRetailers: retailerId } });
    res.json({ msg: 'Followed successfully' });
  } catch (err) {
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
// Add this to users.js
// Place this near the top of your users.js
router.get('/online', async (req, res) => {
  try {
    const role = req.query.role; // 'customer' or 'retailer'
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




// Get interested customers for a retailer
router.get('/interested-customers', async (req, res) => {
  const { retailerId } = req.query;
  if (!retailerId) return res.status(400).json({ msg: 'Missing retailerId' });

  try {
    const customers = await User.find({
      role: 'customer',
      followedRetailers: retailerId,
      location: { $exists: true },
    }).select('-password');

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
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
