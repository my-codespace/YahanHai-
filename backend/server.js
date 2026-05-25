require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const socketIo = require('socket.io');
const User = require('./models/User');
const UserLocation = require('./models/UserLocation');
const CustomerProfile = require('./models/CustomerProfile');
const RetailerProfile = require('./models/RetailerProfile');
const Follow = require('./models/Follow');
const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');

// Database migration to fix missing roles in UserLocation
async function migrateUserLocationRoles() {
  try {
    const locations = await UserLocation.find({ role: { $exists: false } });
    if (locations.length > 0) {
      console.log(`Found ${locations.length} UserLocation documents without a role. Migrating...`);
      for (const loc of locations) {
        const user = await User.findById(loc.userId);
        if (user) {
          loc.role = user.role;
          await loc.save();
          console.log(`Migrated UserLocation for user ${loc.userId} with role ${user.role}`);
        } else {
          console.warn(`User ${loc.userId} not found for UserLocation document. Removing orphaned location document.`);
          await UserLocation.deleteOne({ _id: loc._id });
        }
      }
      console.log('UserLocation roles migration completed.');
    } else {
      console.log('No UserLocation documents missing a role.');
    }
  } catch (err) {
    console.error('Error migrating UserLocation roles:', err);
  }
}

const cookieParser = require('cookie-parser');
connectDB().then(() => {
  migrateUserLocationRoles();
});

const app = express();
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Attach Socket.IO to the HTTP server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions,
});

// Make io accessible in routes via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Server error', error: err.message });
});

// --- Socket.IO real-time logic with heartbeat and multi-device support ---
const userConnections = new Map(); // userId → Set of socket IDs
const lastHeartbeat = new Map(); // userId → timestamp

async function getPopulatedUser(userId) {
  const user = await User.findById(userId).select('-password');
  if (!user) return null;
  const userObj = user.toObject();
  
  if (user.role === 'customer') {
    const profile = await CustomerProfile.findOne({ userId });
    if (profile) Object.assign(userObj, profile.toObject(), { _id: user._id });
    const follows = await Follow.find({ customerId: userId }).select('retailerId');
    userObj.followedRetailers = follows.map(f => f.retailerId.toString());
  } else {
    const profile = await RetailerProfile.findOne({ userId });
    if (profile) Object.assign(userObj, profile.toObject(), { _id: user._id });
  }
  
  const userLoc = await UserLocation.findOne({ userId });
  if (userLoc && userLoc.location && userLoc.location.coordinates) {
    userObj.location = {
      lng: userLoc.location.coordinates[0],
      lat: userLoc.location.coordinates[1]
    };
    userObj.isOnline = userLoc.isOnline;
    userObj.lastSeen = userLoc.lastSeen;
  } else if (userLoc) {
    userObj.isOnline = userLoc.isOnline;
    userObj.lastSeen = userLoc.lastSeen;
  }
  
  return userObj;
}

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('New client connected:', socket.id, 'User:', userId);

  if (userId) {
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(socket.id);
    socket.join(userId);

    if (userConnections.get(userId).size === 1) {
      User.findById(userId).then(userDoc => {
        if (!userDoc) {
          console.error(`User not found for ID: ${userId}`);
          return;
        }
        const initialStatus = socket.handshake.query.isOnline !== 'false';
        return UserLocation.findOneAndUpdate(
          { userId },
          { role: userDoc.role, isOnline: initialStatus, lastSeen: new Date() },
          { upsert: true, new: true }
        ).then(async () => {
          const user = await getPopulatedUser(userId);
          if (user) {
            if (user.role === 'retailer' && initialStatus) {
              const follows = await Follow.find({ retailerId: userId }).select('customerId');
              follows.forEach(f => {
                const customerSockets = userConnections.get(f.customerId.toString());
                if (customerSockets) {
                  customerSockets.forEach(socketId => {
                    io.to(socketId).emit('retailer-online', { retailerId: userId, retailerName: user.name });
                  });
                }
              });
            }
            io.emit('user-status-changed', { userId, isOnline: initialStatus, user });
          }
        });
      }).catch(err => {
        console.error('Error on user connection status update:', err);
      });
    }

    socket.on('heartbeat', async () => {
      const now = Date.now();
      const last = lastHeartbeat.get(userId) || 0;
      if (now - last > 60000) {
        lastHeartbeat.set(userId, now);
        try {
          await UserLocation.findOneAndUpdate({ userId }, { lastSeen: new Date() });
        } catch (err) {
          console.error('Heartbeat update failed:', err);
        }
      }
    });
  }

  socket.on('manual-status-change', async (isOnline) => {
    if (userId) {
      try {
        const userDoc = await User.findById(userId);
        if (userDoc) {
          await UserLocation.findOneAndUpdate(
            { userId },
            { role: userDoc.role, isOnline, lastSeen: new Date() },
            { upsert: true }
          );
          const user = await getPopulatedUser(userId);
          io.emit('user-status-changed', { userId, isOnline, user });
        }
      } catch (err) {
        console.error('Status update failed:', err);
      }
    }
  });

  socket.on('join-room', async (userRole) => {
    if (userRole === 'customer') {
      socket.join('customers');
      try {
        const locs = await UserLocation.find({ role: 'retailer', 'location.coordinates': { $exists: true } });
        const retailers = await Promise.all(locs.map(l => getPopulatedUser(l.userId)));
        const validRetailers = retailers.filter(Boolean).map(r => ({
          ...r,
          isOnline: r.isOnline && userConnections.has(r._id.toString())
        }));
        socket.emit('active-users', validRetailers);
      } catch (err) {
        console.error('Error fetching retailers:', err);
      }
    } else if (userRole === 'retailer') {
      socket.join('retailers');
      try {
        const locs = await UserLocation.find({ role: 'customer', 'location.coordinates': { $exists: true } });
        const customers = await Promise.all(locs.map(l => getPopulatedUser(l.userId)));
        const customersWithStatus = customers.filter(Boolean).map(c => ({
          ...c,
          isOnline: c.isOnline && userConnections.has(c._id.toString())
        }));
        
        // Find which customers follow this retailer
        const follows = await Follow.find({ retailerId: userId });
        const followerIds = new Set(follows.map(f => f.customerId.toString()));
        
        const visibleCustomers = customersWithStatus.filter(c => {
          if (c.isOnline) return true;
          if (followerIds.has(c._id.toString())) return true;
          return false;
        });
        socket.emit('active-users', visibleCustomers);
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    }
  });

  socket.on('location-update', (updatedUser) => {
    try {
      if (updatedUser.role === 'customer') {
        io.to('retailers').emit('location-update', updatedUser);
      } else if (updatedUser.role === 'retailer') {
        io.to('customers').emit('location-update', updatedUser);
      }
    } catch (err) {
      console.error('Error broadcasting location update:', err);
    }
  });

  socket.on('user-logged-out', async (userId) => {
    try {
      await UserLocation.findOneAndUpdate({ userId }, { $unset: { location: "" } });
      io.to('customers').emit('user-logged-out', userId);
      io.to('retailers').emit('user-logged-out', userId);
    } catch (err) {
      console.error('Error handling user logout:', err);
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    if (userId) {
      userConnections.get(userId)?.delete(socket.id);

      if (userConnections.get(userId)?.size === 0) {
        userConnections.delete(userId);
        try {
          const userDoc = await User.findById(userId);
          if (userDoc) {
            await UserLocation.findOneAndUpdate(
              { userId },
              { role: userDoc.role, isOnline: false, lastSeen: new Date() },
              { upsert: true }
            );
            const user = await getPopulatedUser(userId);
            io.emit('user-status-changed', { userId, isOnline: false, user });
          }
        } catch (err) {
          console.error('Disconnect update failed:', err);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('MongoDB connected!');
  console.log('Server running on port ' + PORT);
});
