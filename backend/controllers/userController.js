const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getUsersWithStatus = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getInterestedCustomers = async (req, res) => {
  const { retailerId } = req.query;
  if (!retailerId) return res.status(400).json({ msg: 'Missing retailerId' });
  if (!mongoose.Types.ObjectId.isValid(retailerId)) {
    return res.status(400).json({ msg: 'Invalid retailerId' });
  }

  try {
    const customers = await User.find({
      role: 'customer',
      followedRetailers: new mongoose.Types.ObjectId(retailerId),
      location: { $exists: true },
    }).select('-password');

    res.json(customers.map(c => ({
      id: c._id,
      name: c.name,
      profilePic: c.profilePic,
      city: c.city,
      interest: c.interest,
      lat: c.location?.coordinates?.[1],
      lng: c.location?.coordinates?.[0],
    })));
  } catch (err) {
    console.error('Error in getInterestedCustomers:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getFollowedRetailers = async (req, res) => {
  const { customerId } = req.query;
  if (!customerId) return res.status(400).json({ msg: 'Missing customerId' });
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ msg: 'Invalid customerId' });
  }

  try {
    const customer = await User.findById(customerId).populate('followedRetailers', '-password');
    if (!customer) return res.status(404).json({ msg: 'Customer not found' });
    
    res.json(customer.followedRetailers.map(r => {
      const doc = r.toJSON ? r.toJSON() : r;
      return {
        id: doc._id,
        name: doc.name,
        shopName: doc.shopName,
        profilePic: doc.profilePic,
        businessCategory: doc.businessCategory,
        businessDescription: doc.businessDescription,
        businessLogo: doc.businessLogo,
        retailerPhoto: doc.retailerPhoto,
        operatingHours: doc.operatingHours,
        deliveryAvailable: doc.deliveryAvailable,
        phone: doc.phone,
        city: doc.city,
        lat: doc.location?.coordinates?.[1],
        lng: doc.location?.coordinates?.[0],
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
    await User.findByIdAndUpdate(customerId, { $pull: { followedRetailers: retailerId } });
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
    const user = await User.findByIdAndUpdate(
      userId,
      { location: { type: 'Point', coordinates: [Number(lng), Number(lat)] } },
      { new: true }
    ).select("-password");
    if (req.io) {
      if (user.role === 'customer') {
        req.io.to('retailers').emit("location-update", user);
      } else if (user.role === 'retailer') {
        req.io.to('customers').emit("location-update", user);

        // Proximity Alert Logic
        const nearbyFollowers = await User.find({
          role: 'customer',
          followedRetailers: user._id,
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
              $maxDistance: 200 // 200 meters
            }
          }
        });

        const cooldownPeriod = 20 * 60 * 1000; // 20 minutes
        const now = new Date();

        for (const follower of nearbyFollowers) {
          const lastNotification = await Notification.findOne({
            recipient: follower._id,
            sender: user._id,
            type: 'proximity_alert'
          }).sort({ createdAt: -1 });

          if (!lastNotification || (now - lastNotification.createdAt) > cooldownPeriod) {
            const notif = new Notification({
              recipient: follower._id,
              sender: user._id,
              type: 'proximity_alert',
              message: `${user.name || user.shopName} is within 200m of your location!`
            });
            await notif.save();

            const populatedNotif = await notif.populate('sender', 'name shopName avatarUrl role');
            req.io.to(follower._id.toString()).emit('proximity_alert', populatedNotif);
          }
        }
      }
    }
    res.json({ msg: 'Location updated', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.followRetailer = async (req, res) => {
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
    console.error('Error in followRetailer:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getNearbyRetailers = async (req, res) => {
  const { lat, lng, radius = 2000 } = req.query;
  if (!lat || !lng) return res.status(400).json({ msg: 'Missing coordinates' });

  try {
    const retailers = await User.find({
      role: 'retailer',
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius)
        }
      }
    }).select('-password');

    res.json(retailers.map(r => {
      const doc = r.toJSON();
      return {
        id: doc._id,
        name: doc.name,
        shopName: doc.shopName,
        businessCategory: doc.businessCategory,
        businessDescription: doc.businessDescription,
        businessLogo: doc.businessLogo,
        retailerPhoto: doc.retailerPhoto,
        operatingHours: doc.operatingHours,
        deliveryAvailable: doc.deliveryAvailable,
        phone: doc.phone,
        lat: doc.location?.lat,
        lng: doc.location?.lng,
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
    const query = {
      role: 'customer',
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius)
        }
      }
    };
    
    if (retailerId) {
      query.$or = [
        { isOnline: true },
        { followedRetailers: new mongoose.Types.ObjectId(retailerId) }
      ];
    }

    const customers = await User.find(query).select('-password');

    res.json(customers.map(c => {
      const doc = c.toJSON();
      return {
        id: doc._id,
        name: doc.name,
        profilePic: doc.profilePic,
        city: doc.city,
        interest: doc.interest,
        lat: doc.location?.lat,
        lng: doc.location?.lng,
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
    const filter = {
      "location.coordinates": { $exists: true, $type: "array", $not: { $size: 0 } }
    };
    if (role) filter.role = role;
    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
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
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
