const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const CustomerProfile = require('../models/CustomerProfile');
const RetailerProfile = require('../models/RetailerProfile');
const UserLocation = require('../models/UserLocation');
const Follow = require('../models/Follow');
const parseOperatingHours = require('../utils/parseOperatingHours');

exports.getUsersWithStatus = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    // For simplicity, we can fetch their online status from UserLocation
    const locations = await UserLocation.find();
    const locationMap = locations.reduce((acc, loc) => {
      acc[loc.userId.toString()] = loc.isOnline;
      return acc;
    }, {});
    
    const usersWithStatus = users.map(u => {
      const obj = u.toObject();
      obj.isOnline = locationMap[u._id.toString()] || false;
      return obj;
    });

    res.json(usersWithStatus);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getInterestedCustomers = async (req, res) => {
  const { retailerId } = req.query;
  if (!retailerId || !mongoose.Types.ObjectId.isValid(retailerId)) {
    return res.status(400).json({ msg: 'Invalid retailerId' });
  }

  try {
    const follows = await Follow.find({ retailerId }).select('customerId');
    const customerIds = follows.map(f => f.customerId);

    const customers = await User.find({ _id: { $in: customerIds } }).select('-password');
    const profiles = await CustomerProfile.find({ userId: { $in: customerIds } });
    const locations = await UserLocation.find({ userId: { $in: customerIds } });

    res.json(customers.map(c => {
      const profile = profiles.find(p => p.userId.toString() === c._id.toString());
      const loc = locations.find(l => l.userId.toString() === c._id.toString());
      return {
        id: c._id,
        name: c.name,
        profilePic: profile?.profilePic,
        city: 'N/A', // City was removed in new schema, maybe map to savedAddresses
        interest: 'N/A',
        lat: loc?.location?.coordinates?.[1],
        lng: loc?.location?.coordinates?.[0],
      };
    }));
  } catch (err) {
    console.error('Error in getInterestedCustomers:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getFollowedRetailers = async (req, res) => {
  const { customerId } = req.query;
  if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ msg: 'Invalid customerId' });
  }

  try {
    const follows = await Follow.find({ customerId }).select('retailerId');
    const retailerIds = follows.map(f => f.retailerId);

    const retailers = await User.find({ _id: { $in: retailerIds } }).select('-password');
    const profiles = await RetailerProfile.find({ userId: { $in: retailerIds } });
    const locations = await UserLocation.find({ userId: { $in: retailerIds } });

    res.json(retailers.map(r => {
      const profile = profiles.find(p => p.userId.toString() === r._id.toString());
      const loc = locations.find(l => l.userId.toString() === r._id.toString());
      return {
        id: r._id,
        name: r.name,
        shopName: profile?.shopName,
        businessCategory: profile?.businessCategory,
        businessDescription: profile?.businessDescription,
        businessLogo: profile?.businessLogo,
        retailerPhoto: profile?.ownerPhoto,
        operatingHours: profile?.operatingHours?.open ? `${profile.operatingHours.open} - ${profile.operatingHours.close}` : '',
        deliveryAvailable: profile?.deliveryAvailable,
        phone: r.phone,
        lat: loc?.location?.coordinates?.[1],
        lng: loc?.location?.coordinates?.[0],
      };
    }));
  } catch (err) {
    console.error('Error in getFollowedRetailers:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.unfollowRetailer = async (req, res) => {
  const { customerId, retailerId } = req.body;
  if (!customerId || !retailerId) return res.status(400).json({ msg: 'Missing data' });
  try {
    await Follow.findOneAndDelete({ customerId, retailerId });
    res.json({ msg: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateLocation = async (req, res) => {
  const { userId, lat, lng } = req.body;
  if (!userId || lat === undefined || lng === undefined) {
    return res.status(400).json({ msg: 'Missing data' });
  }
  
  try {
    // We need the full user info to emit
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const existingLoc = await UserLocation.findOne({ userId });
    const isOnline = existingLoc ? existingLoc.isOnline : true;

    let locationDoc = await UserLocation.findOneAndUpdate(
      { userId },
      { 
        role: user.role,
        location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        isOnline,
        lastSeen: new Date()
      },
      { new: true, upsert: true }
    );
    
    const userObj = user.toObject();
    
    if (user.role === 'customer') {
      const profile = await CustomerProfile.findOne({ userId: user._id });
      if (profile) Object.assign(userObj, profile.toObject(), { _id: user._id });
      const follows = await Follow.find({ customerId: user._id }).select('retailerId');
      userObj.followedRetailers = follows.map(f => f.retailerId.toString());
    } else {
      const profile = await RetailerProfile.findOne({ userId: user._id });
      if (profile) Object.assign(userObj, profile.toObject(), { _id: user._id });
    }
    
    userObj.location = { lat: Number(lat), lng: Number(lng) };
    userObj.isOnline = isOnline;
    userObj.lastSeen = locationDoc.lastSeen;

    if (req.io) {
      if (user.role === 'customer') {
        req.io.to('retailers').emit("location-update", userObj);
      } else if (user.role === 'retailer') {
        req.io.to('customers').emit("location-update", userObj);

        // Async Proximity Alert Logic
        dispatchProximityAlerts(userObj, lat, lng, req.io);
      }
    }
    res.json({ msg: 'Location updated', user: userObj });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Extracted Proximity Alert Logic
async function dispatchProximityAlerts(retailerUser, lat, lng, io) {
  try {
    const nearbyLocations = await UserLocation.find({
      role: 'customer',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: 200 // 200 meters
        }
      }
    });

    const nearbyUserIds = nearbyLocations.map(loc => loc.userId);
    
    // Filter by those who follow this retailer
    const follows = await Follow.find({
      retailerId: retailerUser._id,
      customerId: { $in: nearbyUserIds }
    });
    
    const followerIds = follows.map(f => f.customerId);
    
    // Filter out customers who disabled proximity alerts
    const followerProfiles = await CustomerProfile.find({
      userId: { $in: followerIds },
      'notificationPreferences.proximityAlerts': { $ne: false }
    });
    const validFollowerIds = followerProfiles.map(p => p.userId);
    
    const cooldownPeriod = 20 * 60 * 1000; // 20 minutes
    const now = new Date();

    for (const followerId of validFollowerIds) {
      const lastNotification = await Notification.findOne({
        recipient: followerId,
        sender: retailerUser._id,
        type: 'proximity_alert'
      }).sort({ createdAt: -1 });

      if (!lastNotification || (now - lastNotification.createdAt) > cooldownPeriod) {
        const notif = new Notification({
          recipient: followerId,
          sender: retailerUser._id,
          type: 'proximity_alert',
          message: `${retailerUser.name} is within 200m of your location!`
        });
        await notif.save();

        const populatedNotif = await notif.populate('sender', 'name avatarUrl role');
        io.to(followerId.toString()).emit('proximity_alert', populatedNotif);
      }
    }
  } catch (error) {
    console.error("Proximity Alert Error:", error);
  }
}

exports.followRetailer = async (req, res) => {
  const { customerId, retailerId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(customerId) || !mongoose.Types.ObjectId.isValid(retailerId)) {
    return res.status(400).json({ msg: 'Invalid IDs' });
  }
  try {
    await Follow.findOneAndUpdate(
      { customerId, retailerId },
      { customerId, retailerId },
      { upsert: true, new: true }
    );
    res.json({ msg: 'Followed successfully' });
  } catch (err) {
    console.error('Error in followRetailer:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getNearbyRetailers = async (req, res) => {
  const { lat, lng, radius = 2000 } = req.query;
  if (!lat || !lng) return res.status(400).json({ msg: 'Missing coordinates' });

  try {
    const nearbyLocations = await UserLocation.find({
      role: 'retailer',
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius)
        }
      }
    });

    const retailerIds = nearbyLocations.map(loc => loc.userId);
    const users = await User.find({ _id: { $in: retailerIds } }).select('-password');
    const profiles = await RetailerProfile.find({ userId: { $in: retailerIds } });

    res.json(users.map(u => {
      const profile = profiles.find(p => p.userId.toString() === u._id.toString());
      const loc = nearbyLocations.find(l => l.userId.toString() === u._id.toString());
      return {
        id: u._id,
        name: u.name,
        shopName: profile?.shopName,
        businessCategory: profile?.businessCategory,
        businessDescription: profile?.businessDescription,
        businessLogo: profile?.businessLogo,
        retailerPhoto: profile?.ownerPhoto,
        operatingHours: profile?.operatingHours?.open ? `${profile.operatingHours.open} - ${profile.operatingHours.close}` : '',
        deliveryAvailable: profile?.deliveryAvailable,
        phone: u.phone,
        lat: loc?.location?.coordinates?.[1],
        lng: loc?.location?.coordinates?.[0],
      };
    }));
  } catch (err) {
    console.error('Error fetching retailers:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getNearbyCustomers = async (req, res) => {
  const { lat, lng, radius = 2000, retailerId } = req.query;
  if (!lat || !lng) return res.status(400).json({ msg: 'Missing coordinates' });

  try {
    const nearbyLocations = await UserLocation.find({
      role: 'customer',
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius)
        }
      }
    });

    let customerIds = nearbyLocations.map(loc => loc.userId);

    if (retailerId) {
      // If retailerId is provided, we should filter by online or followed
      const follows = await Follow.find({ retailerId, customerId: { $in: customerIds } });
      const followedCustomerIds = follows.map(f => f.customerId.toString());
      
      const filteredLocations = nearbyLocations.filter(loc => 
        loc.isOnline || followedCustomerIds.includes(loc.userId.toString())
      );
      customerIds = filteredLocations.map(loc => loc.userId);
    }

    const users = await User.find({ _id: { $in: customerIds } }).select('-password');
    const profiles = await CustomerProfile.find({ userId: { $in: customerIds } });

    res.json(users.map(u => {
      const profile = profiles.find(p => p.userId.toString() === u._id.toString());
      const loc = nearbyLocations.find(l => l.userId.toString() === u._id.toString());
      return {
        id: u._id,
        name: u.name,
        profilePic: profile?.profilePic,
        city: 'N/A', // Removed from schema
        interest: 'N/A',
        lat: loc?.location?.coordinates?.[1],
        lng: loc?.location?.coordinates?.[0],
      };
    }));
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getOnlineUsers = async (req, res) => {
  try {
    const role = req.query.role;
    const filter = { isOnline: true, "location.coordinates": { $exists: true } };
    if (role) filter.role = role;
    
    const locations = await UserLocation.find(filter);
    const userIds = locations.map(loc => loc.userId);
    
    const users = await User.find({ _id: { $in: userIds } }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body || {};

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Separate base user fields and profile fields
    const baseFields = ['name', 'phone', 'avatarUrl'];
    const baseData = {};
    const profileData = {};

    Object.keys(updateData).forEach(key => {
      if (baseFields.includes(key)) {
        baseData[key] = updateData[key];
      } else if (key !== 'role' && key !== '_id' && key !== 'password') {
        profileData[key] = updateData[key];
      }
    });

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePic) {
        profileData.profilePic = req.files.profilePic[0].path;
      }
      if (req.files.businessLogo) {
        profileData.businessLogo = req.files.businessLogo[0].path;
      }
      if (req.files.retailerPhoto) {
        profileData.ownerPhoto = req.files.retailerPhoto[0].path;
      }
      if (req.files.storefrontPhoto) {
        profileData.storefrontPhoto = req.files.storefrontPhoto[0].path;
      }
    }

    if (Object.keys(baseData).length > 0) {
      await User.findByIdAndUpdate(id, baseData);
    }

    if (user.role === 'customer') {
      // Parse stringified objects/arrays from FormData
      if (typeof profileData.notificationPreferences === 'string') {
        try {
          profileData.notificationPreferences = JSON.parse(profileData.notificationPreferences);
        } catch (e) {
          console.error('Failed to parse notificationPreferences', e);
        }
      }
      if (typeof profileData.savedAddresses === 'string') {
        try {
          profileData.savedAddresses = JSON.parse(profileData.savedAddresses);
        } catch (e) {
          console.error('Failed to parse savedAddresses', e);
        }
      }

      await CustomerProfile.findOneAndUpdate({ userId: id }, profileData, { upsert: true, new: true });
    } else {
      // Parse operating hours from FormData
      if (profileData.operatingHours !== undefined) {
        if (typeof profileData.operatingHours === 'string') {
          try {
            profileData.operatingHours = JSON.parse(profileData.operatingHours);
          } catch (e) {
            profileData.operatingHours = parseOperatingHours(profileData.operatingHours);
          }
        } else {
          profileData.operatingHours = parseOperatingHours(profileData.operatingHours);
        }
      }
      
      // Parse deliveryAvailable boolean
      if (profileData.deliveryAvailable !== undefined) {
        profileData.deliveryAvailable = profileData.deliveryAvailable === 'true' || profileData.deliveryAvailable === true;
      }

      await RetailerProfile.findOneAndUpdate({ userId: id }, profileData, { upsert: true, new: true });
    }

    // Return the fully populated user object
    const updatedUser = await User.findById(id).select('-password');
    if (!updatedUser) return res.status(404).json({ msg: "User not found" });

    const userObj = updatedUser.toObject();
    
    if (updatedUser.role === 'customer') {
      const profile = await CustomerProfile.findOne({ userId: updatedUser._id });
      if (profile) Object.assign(userObj, profile.toObject(), { _id: updatedUser._id });
      const follows = await Follow.find({ customerId: updatedUser._id }).select('retailerId');
      userObj.followedRetailers = follows.map(f => f.retailerId.toString());
    } else {
      const profile = await RetailerProfile.findOne({ userId: updatedUser._id });
      if (profile) Object.assign(userObj, profile.toObject(), { _id: updatedUser._id });
    }

    const userLocation = await UserLocation.findOne({ userId: updatedUser._id });
    if (userLocation && userLocation.location && userLocation.location.coordinates) {
      userObj.location = {
        lng: userLocation.location.coordinates[0],
        lat: userLocation.location.coordinates[1]
      };
      userObj.isOnline = userLocation.isOnline;
      userObj.lastSeen = userLocation.lastSeen;
    }

    res.json(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    const userObj = user.toObject();
    
    if (user.role === 'customer') {
      const profile = await CustomerProfile.findOne({ userId: user._id });
      if (profile) Object.assign(userObj, profile.toObject(), { _id: user._id });
      // Populate followedRetailers from Follow collection
      const follows = await Follow.find({ customerId: user._id }).select('retailerId');
      userObj.followedRetailers = follows.map(f => f.retailerId.toString());
    } else {
      const profile = await RetailerProfile.findOne({ userId: user._id });
      if (profile) Object.assign(userObj, profile.toObject(), { _id: user._id });
    }
    
    // Fetch UserLocation
    const userLocation = await UserLocation.findOne({ userId: user._id });
    if (userLocation && userLocation.location && userLocation.location.coordinates) {
      userObj.location = {
        lng: userLocation.location.coordinates[0],
        lat: userLocation.location.coordinates[1]
      };
      userObj.isOnline = userLocation.isOnline;
      userObj.lastSeen = userLocation.lastSeen;
    }
    
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Admin migration: clear all stale local uploads/ paths from CustomerProfile and RetailerProfile.
 * These are paths like "uploads/businessLogo_xxx.png" stored before Cloudinary integration.
 * After this runs, users will see the default placeholder and can re-upload via Edit Profile.
 * Protected by a secret key to prevent accidental execution.
 */
exports.clearStaleLocalImages = async (req, res) => {
  // Simple secret guard — set MIGRATION_SECRET in Render env vars
  const { secret } = req.query;
  if (!secret || secret !== process.env.MIGRATION_SECRET) {
    return res.status(403).json({ msg: 'Forbidden: invalid secret' });
  }

  try {
    // Helper: returns true if value is a local uploads/ path (not http/https)
    const isLocalPath = (val) => val && typeof val === 'string' && !val.startsWith('http');

    // Clear stale paths in RetailerProfile
    const retailers = await RetailerProfile.find({});
    let retailerFixed = 0;
    for (const p of retailers) {
      const update = {};
      if (isLocalPath(p.businessLogo))   update.businessLogo   = null;
      if (isLocalPath(p.ownerPhoto))     update.ownerPhoto     = null;
      if (isLocalPath(p.storefrontPhoto)) update.storefrontPhoto = null;
      if (Object.keys(update).length > 0) {
        await RetailerProfile.findByIdAndUpdate(p._id, { $set: update });
        retailerFixed++;
      }
    }

    // Clear stale paths in CustomerProfile
    const customers = await CustomerProfile.find({});
    let customerFixed = 0;
    for (const p of customers) {
      const update = {};
      if (isLocalPath(p.profilePic)) update.profilePic = null;
      if (Object.keys(update).length > 0) {
        await CustomerProfile.findByIdAndUpdate(p._id, { $set: update });
        customerFixed++;
      }
    }

    res.json({
      msg: 'Migration complete',
      retailerProfilesFixed: retailerFixed,
      customerProfilesFixed: customerFixed,
    });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ msg: 'Migration failed', error: err.message });
  }
};
