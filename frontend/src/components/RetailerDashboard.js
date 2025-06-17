import React, { useEffect, useState } from "react";
import MapPanel from "./MapPanel";
import MapPicker from "./MapPicker";
import { updateUserLocation } from "../api/index.js";
import { io } from "socket.io-client";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

export default function RetailerDashboard({ user, onLogout, searchTerm = "", filterRole = "customer" }) {
  const [mode, setMode] = useState("manual");
  const [location, setLocation] = useState(
    user?.location?.lat && user?.location?.lng
      ? user.location
      : DEFAULT_CENTER
  );
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showPicker, setShowPicker] = useState(false);

  // Fetch initial users with status
  // useEffect(() => {
  //   fetch('/api/users/with-status')
  //     .then(res => res.json())
  //     .then(data => setUsers(data.filter(u => u.location)));
  // }, []);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    if (!user) return;
  
    // Connect to the socket
    const socket = io('http://localhost:5000', {
      query: { userId: user._id }
    });
    socket.emit('join-room', user.role); 
  
    // Start heartbeat: send 'heartbeat' every 5 seconds
    const heartbeatInterval = setInterval(() => {
      socket.emit('heartbeat');
    }, 5000);
  
    // Listen for active users (with online status)
    socket.on('active-users', (activeUsers) => {
      setUsers(activeUsers);
      // Initialize onlineUsers state
      const initialOnline = new Set(
        activeUsers.filter(u => u.isOnline).map(u => u._id)
      );
      setOnlineUsers(initialOnline);
    });
  
    // Listen for real-time status changes
    socket.on('user-status-changed', ({ userId, isOnline }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        isOnline ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      });
    });
  
    // Listen for location updates
    socket.on('location-update', (updatedUser) => {
      setUsers(prev =>
        prev.map(u => u._id === updatedUser._id ? updatedUser : u)
      );
    });
  
    // Listen for user logout
    socket.on('user-logged-out', (userId) => {
      setUsers(prev => prev.filter(u => u._id !== userId));
    });
  
    // Clean up on unmount
    return () => {
      clearInterval(heartbeatInterval);
      socket.disconnect();
    };
  }, [user?._id]);
  

  // Set location (for both manual and live mode)
  const handleLocationChange = (lat, lng) => {
    setLocation({ lat, lng });
    updateUserLocation(user._id, lat, lng);
  };

  // Live location updates
  useEffect(() => {
    let watchId;
    if (mode === "live" && navigator.geolocation && user) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          handleLocationChange(newLoc.lat, newLoc.lng);
        },
        () => {}
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [mode, user]);

  // Send location updates every 5 seconds, regardless of mode
  useEffect(() => {
    let intervalId;
    if (user && location) {
      // Send immediately
      updateUserLocation(user._id, location.lat, location.lng);
      // Then every 5 seconds
      intervalId = setInterval(() => {
        updateUserLocation(user._id, location.lat, location.lng);
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, location]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleManualLocation = async (latlng) => {
    setShowPicker(false);
    setMode("manual");
    handleLocationChange(latlng.lat, latlng.lng);
  };

  const handleLogout = async () => {
    const socket = io("http://localhost:5000");
    socket.emit('user-logged-out', user._id);
    onLogout();
  };

  // Filter users based on searchTerm and filterRole
  const filteredMarkers = users
    .filter(u => u && u.location && u.location.lat && u.location.lng)
    .filter(u => {
      // Apply role filter
      if (filterRole !== "all" && u.role !== filterRole) return false;
      // Apply search filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.shopName && u.shopName.toLowerCase().includes(term)) ||
        (u.city && u.city.toLowerCase().includes(term))
      );
    })
    .map(u => ({
      ...u,
      lat: u.location.lat,
      lng: u.location.lng,
      isOnline: onlineUsers.has(u._id)
    }));

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1>Dashboard</h1>
      <p>You are logged in as a <b>retailer</b>.</p>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setMode("live")}
          style={{
            background: mode === "live" ? "#1976d2" : "#e3e9f7",
            color: mode === "live" ? "#fff" : "#1976d2",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 600,
            marginRight: 12,
            cursor: "pointer",
          }}
        >
          Share My Live Location
        </button>
        <button
          onClick={() => setShowPicker(true)}
          style={{
            background: mode === "manual" ? "#1976d2" : "#e3e9f7",
            color: mode === "manual" ? "#fff" : "#1976d2",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Set Location Manually
        </button>
      </div>
      {showPicker && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{ background: "#fff", borderRadius: 12, padding: 24, minWidth: 350 }}
          >
            <h3>Set Your Location</h3>
            <MapPicker
              initialCenter={location}
              avatarUser={user}
              onConfirm={handleManualLocation}
              onCancel={() => setShowPicker(false)}
            />
          </div>
        </div>
      )}
      <MapPanel
        location={location}
        markers={filteredMarkers}
        role={user.role}
        user={user}
      />
    </div>
  );
}
