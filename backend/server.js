require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const socketIo = require('socket.io');
const User = require('./models/User');

const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach Socket.IO to the HTTP server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // For development; restrict in production
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Server error', error: err.message });
});

// Socket.IO real-time logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room and send active users of opposite role
  socket.on('join-room', (userRole) => {
    if (userRole === 'customer') {
      socket.join('retailers');
      User.find({
        role: 'retailer',
        "location.lat": { $exists: true, $ne: null },
        "location.lng": { $exists: true, $ne: null }
      }).select('-password')
        .then(retailers => socket.emit('active-users', retailers))
        .catch(err => console.error('Error fetching retailers:', err));
    } else if (userRole === 'retailer') {
      socket.join('customers');
      User.find({
        role: 'customer',
        "location.lat": { $exists: true, $ne: null },
        "location.lng": { $exists: true, $ne: null }
      }).select('-password')
        .then(customers => socket.emit('active-users', customers))
        .catch(err => console.error('Error fetching customers:', err));
    }
  });

  // Broadcast location updates
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

  // Handle user logout
  socket.on('user-logged-out', (userId) => {
    try {
      User.findByIdAndUpdate(userId, { $set: { location: null } })
        .then(() => {
          io.to('customers').emit('user-logged-out', userId);
          io.to('retailers').emit('user-logged-out', userId);
        })
        .catch(err => console.error('Error updating user location on logout:', err));
    } catch (err) {
      console.error('Error handling user logout:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('MongoDB connected!');
  console.log('Server running on port ' + PORT);
});
