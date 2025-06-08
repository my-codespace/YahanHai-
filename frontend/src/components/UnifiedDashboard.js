import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import ProfileCard from "./ProfileCard";
import StatsCard from "./StatsCard";
import QuickActions from "./QuickActions";
import ActivityFeed from "./ActivityFeed";
import { getNearbyUsers, getUserProfile, followRetailer } from "../api/index.js";
import RetailerList from "./RetailerList";
import CustomerList from "./CustomerList";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

export default function UnifiedDashboard({ user, onLogout, onUpdateUser }) {
  const [location, setLocation] = useState(
    user.location && user.location.lat && user.location.lng ? user.location : null
  );
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [filter, setFilter] = useState("all"); // all, customer, retailer

  // Get geolocation if no location set
  useEffect(() => {
    if (!location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geoLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(geoLoc);
        },
        () => setLocation(DEFAULT_CENTER)
      );
    }
  }, [location]);

  // Fetch nearby users on location or filter change
  useEffect(() => {
    if (location) {
      getNearbyUsers(location.lat, location.lng, filter)
        .then((data) => setNearbyUsers(Array.isArray(data) ? data : []))
        .catch(() => setNearbyUsers([]));
    }
  }, [location, filter]);

  // Follow/unfollow retailer (only for customers)
  const handleFollow = async (retailerId) => {
    try {
      await followRetailer(user._id, retailerId);
      const updatedUser = await getUserProfile(user._id);
      onUpdateUser(updatedUser);
    } catch (err) {
      alert("Follow/unfollow failed.");
    }
  };

  // View profile handler
  const handleViewProfile = (id) => {
    window.location.href = `/profile/${id}`;
  };

  // Prepare markers for map
  const markers = (Array.isArray(nearbyUsers) ? nearbyUsers : [])
    .filter((u) => u.location && u.location.lat && u.location.lng)
    .map((u) => ({
      lat: u.location.lat,
      lng: u.location.lng,
      avatarUrl:
        u.role === "retailer"
          ? u.businessLogo
            ? `http://localhost:5000/${u.businessLogo}`
            : undefined
          : u.profilePic
          ? `http://localhost:5000/${u.profilePic}`
          : undefined,
      label: u.role === "retailer" ? u.shopName : u.name,
      id: u._id,
      role: u.role,
      description: u.role === "retailer" ? u.businessCategory : u.city,
      isFollowing:
        u.role === "retailer" &&
        Array.isArray(user.followedRetailers) &&
        user.followedRetailers.includes(u._id),
    }));

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
          background: "white",
          padding: "16px 24px",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#1976d2",
            }}
          >
            Namaste, {user.name}! 👋
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "1rem" }}>
            Welcome to your YahanHai! dashboard
          </p>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: "#e53935",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>

      {/* Filter Dropdown */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="filter" style={{ marginRight: 8, fontWeight: 600 }}>
          Show:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="all">All</option>
          <option value="customer">Customers</option>
          <option value="retailer">Retailers</option>
        </select>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <ProfileCard user={user} />
        <StatsCard
          stats={{
            followedRetailers: user.followedRetailers?.length || 0,
            checkIns: 0,
            profileCompleteness: 85,
          }}
          role={user.role}
        />
        <QuickActions role={user.role} location={location} />
      </div>

      {/* Map and Activity Feed */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <MapView
          center={location || DEFAULT_CENTER}
          markers={markers}
          onPopupButton={(m) =>
            m.role === "retailer" && user.role === "customer" ? (
              <>
                <button
                  onClick={() => handleFollow(m.id)}
                  style={{ marginRight: 8 }}
                >
                  {m.isFollowing ? "Unfollow" : "Follow"}
                </button>
                <button onClick={() => handleViewProfile(m.id)}>
                  View Profile
                </button>
              </>
            ) : (
              <button onClick={() => handleViewProfile(m.id)}>View Profile</button>
            )
          }
        />
        <ActivityFeed role={user.role} />
      </div>

      {/* List */}
      <div>
        {filter === "customer" && (
          <CustomerList
            customers={markers.filter((m) => m.role === "customer")}
          />
        )}
        {filter === "retailer" && (
          <RetailerList
            retailers={markers.filter((m) => m.role === "retailer")}
            followedIds={user.followedRetailers}
            onFollow={handleFollow}
            onProfileClick={handleViewProfile}
          />
        )}
        {filter === "all" && (
          <>
            <CustomerList
              customers={markers.filter((m) => m.role === "customer")}
            />
            <RetailerList
              retailers={markers.filter((m) => m.role === "retailer")}
              followedIds={user.followedRetailers}
              onFollow={handleFollow}
              onProfileClick={handleViewProfile}
            />
          </>
        )}
      </div>
    </div>
  );
}
