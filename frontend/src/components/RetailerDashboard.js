import React, { useEffect, useState } from "react";
import MapPanel from "./MapPanel";
import MapPicker from "./MapPicker";
import { updateUserLocation } from "../api/index.js";
import { io } from "socket.io-client";
import createAvatarIcon from "../utils/createAvatarIcon";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

export default function RetailerDashboard({ user, onLogout }) {
  const [mode, setMode] = useState("manual");
  const [location, setLocation] = useState(
    user?.location?.lat && user?.location?.lng
      ? user.location
      : DEFAULT_CENTER
  );
  const [users, setUsers] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  // Join Socket.IO room and get all active customers
  useEffect(() => {
    if (!user) return;
    const socket = io("http://localhost:5000");
    socket.emit('join-room', user.role);

    socket.on('active-users', (activeUsers) => {
      setUsers(activeUsers);
    });

    socket.on('location-update', (updatedUser) => {
      setUsers(prevUsers => {
        const exists = prevUsers.some(u => u._id === updatedUser._id);
        if (exists) {
          return prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u);
        } else {
          return [...prevUsers, updatedUser];
        }
      });
    });

    socket.on('user-logged-out', (userId) => {
      setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
    });

    return () => socket.disconnect();
  }, [user]);

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

  const markers = users
    .filter(u => u && u.role === 'customer' && u.location && u.location.lat && u.location.lng)
    .map(u => ({
      ...u,
      lat: u.location.lat,
      lng: u.location.lng
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
        markers={markers}
        role={user.role}
        user={user}
      />
      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleLogout}
          style={{
            background: "#e53935",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
        <button
          style={{
            marginLeft: 8,
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            fontWeight: 600,
          }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
