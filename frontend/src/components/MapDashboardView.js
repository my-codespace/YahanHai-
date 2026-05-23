import React, { useState, useEffect, useRef } from 'react';
import { Box, useTheme, useMediaQuery, InputBase, Drawer, IconButton, Switch, Typography, Button, Avatar, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { FiSearch, FiX, FiNavigation, FiMapPin, FiCrosshair } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { updateUserLocation, followRetailer, unfollowRetailer, updateUserProfile } from '../api/index';
import createAvatarIcon from '../utils/createAvatarIcon';
import { useNavigate } from 'react-router-dom';
import MapPicker from './MapPicker';

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

// Floating action button for "My Location"
function MyLocationButton({ location }) {
  const map = useMap();
  const handleClick = () => {
    if (location && location.lat) {
      map.flyTo([location.lat, location.lng], 15, { animate: true });
    }
  };
  return (
    <IconButton
      onClick={handleClick}
      sx={{
        position: 'absolute',
        bottom: 90,
        right: 24,
        zIndex: 1000,
        backgroundColor: '#1976d2',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        '&:hover': { backgroundColor: '#1565c0' }
      }}
    >
      <FiNavigation />
    </IconButton>
  );
}

// Component to auto-center the map when the user location first loads or updates
function MapCenterController({ center, mode }) {
  const map = useMap();
  const autoCenterRef = useRef(true);

  // Re-enable auto-centering if the mode changes or if center is reset/changed manually
  useEffect(() => {
    autoCenterRef.current = true;
  }, [mode]);

  useEffect(() => {
    // When the map is dragged by the user, stop auto-centering
    const handleDragStart = () => {
      autoCenterRef.current = false;
    };
    map.on('dragstart', handleDragStart);
    return () => {
      map.off('dragstart', handleDragStart);
    };
  }, [map]);

  useEffect(() => {
    if (center && center.lat && center.lng) {
      if (autoCenterRef.current) {
        map.setView([center.lat, center.lng], map.getZoom());
      }
    }
  }, [center, map]);

  return null;
}

function MapDashboardView({ user, setUser }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [location, setLocation] = useState(
    user?.location?.lat && user?.location?.lng ? user.location : DEFAULT_CENTER
  );

  useEffect(() => {
    if (user?.location?.lat && user?.location?.lng) {
      setLocation(user.location);
    }
  }, [user?.location?.lat, user?.location?.lng]);

  // Location Modes
  const [mode, setMode] = useState(() => localStorage.getItem('locationMode') || "live");
  const [showPicker, setShowPicker] = useState(false);

  // Drawer state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Status toggle
  const [isOnlineStatus, setIsOnlineStatus] = useState(() => {
    const saved = localStorage.getItem('isOnlineStatus');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isProximityAlertsEnabled, setIsProximityAlertsEnabled] = useState(
    user?.notificationPreferences?.proximityAlerts ?? true
  );
  const socketRef = useRef(null);

  const isOnlineStatusRef = useRef(isOnlineStatus);
  useEffect(() => {
    isOnlineStatusRef.current = isOnlineStatus;
  }, [isOnlineStatus]);

  // --- Socket Logic ---
  useEffect(() => {
    if (!user) return;
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl, { 
      query: { 
        userId: user._id,
        isOnline: isOnlineStatus
      } 
    });
    
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-room', user.role);
    });

    const heartbeatInterval = setInterval(() => {
      if (isOnlineStatusRef.current) socketRef.current.emit('heartbeat');
    }, 5000);

    socketRef.current.on('active-users', (activeUsers) => {
      const validUsers = activeUsers || [];
      setUsers(validUsers);
      const initialOnline = new Set(validUsers.filter(u => u && u.isOnline).map(u => u._id));
      setOnlineUsers(initialOnline);
    });

    socketRef.current.on('user-status-changed', ({ userId, isOnline, user: eventUser }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        isOnline ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      });

      if (isOnline && eventUser && eventUser.location && eventUser.location.lat) {
        if (eventUser.role !== user.role) {
          setUsers(prev => {
            const exists = prev.find(u => u?._id === userId);
            if (exists) {
              return prev.map(u => u?._id === userId ? { ...eventUser, isOnline: true } : u);
            }
            return [...prev, { ...eventUser, isOnline: true }];
          });
        }
      } else if (!isOnline && eventUser && eventUser.role === 'customer' && user.role === 'retailer') {
        const followsMe = eventUser.followedRetailers && eventUser.followedRetailers.some(id => id.toString() === user._id);
        if (!followsMe) {
          setUsers(prev => prev.filter(u => u?._id !== userId));
        }
      }
    });

    socketRef.current.on('location-update', (updatedUser) => {
      setUsers(prev => {
        const exists = prev.find(u => u?._id === updatedUser._id);
        if (exists) {
          return prev.map(u => u?._id === updatedUser._id ? updatedUser : u);
        }
        return [...prev, updatedUser];
      });
    });

    socketRef.current.on('user-logged-out', (userId) => {
      setUsers(prev => prev.filter(u => u?._id !== userId));
    });

    return () => {
      clearInterval(heartbeatInterval);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  const handleStatusToggle = (e) => {
    const online = e.target.checked;
    setIsOnlineStatus(online);
    localStorage.setItem('isOnlineStatus', JSON.stringify(online));
    if (socketRef.current) {
      socketRef.current.emit('manual-status-change', online);
    }
  };

  const handleProximityToggle = async (e) => {
    const enabled = e.target.checked;
    setIsProximityAlertsEnabled(enabled);
    try {
      await updateUserProfile(user._id, { 
        notificationPreferences: { proximityAlerts: enabled } 
      });
      if (setUser) {
        setUser(prev => ({ 
          ...prev, 
          notificationPreferences: { proximityAlerts: enabled } 
        }));
      }
    } catch (err) {
      console.error('Failed to update proximity alerts preference', err);
    }
  };

  const handleLocationChange = (lat, lng) => {
    setLocation({ lat, lng });
    updateUserLocation(user._id, lat, lng);
    if (setUser) {
      setUser(prev => ({ ...prev, location: { lat, lng } }));
    }
  };

  // --- Live Location Logic ---
  useEffect(() => {
    let watchId;
    if (mode === "live" && navigator.geolocation && user && isOnlineStatus) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          handleLocationChange(newLoc.lat, newLoc.lng);
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [mode, user, isOnlineStatus]);

  const handleManualLocation = async (latlng) => {
    setShowPicker(false);
    setMode("manual");
    handleLocationChange(latlng.lat, latlng.lng);
  };

  const handleMarkerClick = (markerUser) => {
    setSelectedUser(markerUser);
    setIsDrawerOpen(true);
  };

  const handleVisitProfile = () => {
    if (selectedUser) {
      if (selectedUser.role === 'retailer') {
        navigate(`/dashboard/retailer/${selectedUser._id}`);
      } else {
        navigate(`/dashboard/profile/${selectedUser._id}`);
      }
    }
  };

  const handleFollow = async () => {
    if (!selectedUser || !user) return;
    const isFollowing = user.followedRetailers?.includes(selectedUser._id);
    try {
      if (isFollowing) {
        await unfollowRetailer(user._id, selectedUser._id);
        setUser(prev => ({
          ...prev,
          followedRetailers: (prev.followedRetailers || []).filter(id => id !== selectedUser._id)
        }));
      } else {
        await followRetailer(user._id, selectedUser._id);
        setUser(prev => ({
          ...prev,
          followedRetailers: [...(prev.followedRetailers || []), selectedUser._id]
        }));
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    }
  };

  // Filter users based on search
  const filteredMarkers = users
    .filter(u => u && u.location && u.location.lat && u.location.lng)
    .filter(u => {
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

  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    borderRadius: 24,
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* FULL BLEED MAP */}
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        zoomControl={false}
        style={{ height: '100vh', width: '100vw', zIndex: 0 }}
        minZoom={2.5}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          noWrap={true}
        />
        
        {/* Current User Marker */}
        <Marker position={[location.lat, location.lng]} icon={createAvatarIcon(user)}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Other Users Markers */}
        {filteredMarkers.map((marker, idx) => (
          <Marker
            key={idx}
            position={[marker.lat, marker.lng]}
            icon={createAvatarIcon(marker)}
            eventHandlers={{
              click: () => handleMarkerClick(marker)
            }}
          />
        ))}

        <MyLocationButton location={location} />
        <MapCenterController center={location} mode={mode} />
      </MapContainer>

      {/* FLOATING SEARCH & STATUS BAR */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '8px 16px',
          zIndex: 1000,
          width: isMobile ? '90%' : '400px',
          ...glassmorphismStyle
        }}
      >
        <FiSearch size={20} color="#555" />
        <InputBase
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, ml: 1, fontFamily: 'Inter, sans-serif' }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, borderLeft: '1px solid #ddd', pl: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: isOnlineStatus ? '#4CAF50' : '#757575' }}>
            {isOnlineStatus ? 'Online' : 'Offline'}
          </Typography>
          <Switch 
            size="small" 
            checked={isOnlineStatus} 
            onChange={handleStatusToggle} 
            color="primary"
          />
        </Box>
        {user?.role === 'customer' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, borderLeft: '1px solid #ddd', pl: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isProximityAlertsEnabled ? '#1976d2' : '#757575' }}>
              Alerts
            </Typography>
            <Switch 
              size="small" 
              checked={isProximityAlertsEnabled} 
              onChange={handleProximityToggle} 
              color="info"
            />
          </Box>
        )}
      </Box>

      {/* LOCATION MODE TOGGLE (Live vs Manual) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: isMobile ? 100 : 24, // Keep above the mobile dock
          left: isMobile ? '50%' : 24, // Follow desktop nav dock or mobile center
          transform: isMobile ? 'translateX(-50%)' : 'none',
          zIndex: 1000,
          ...glassmorphismStyle,
          padding: '4px',
          borderRadius: 16
        }}
      >
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(e, newMode) => {
            if (newMode !== null) {
              setMode(newMode);
              localStorage.setItem('locationMode', newMode);
              if (newMode === 'manual') setShowPicker(true);
            }
          }}
          size="small"
        >
          <ToggleButton value="live" sx={{ borderRadius: '12px !important', px: 2, textTransform: 'none', fontWeight: 600, border: 'none' }}>
            <FiCrosshair style={{ marginRight: 6 }} /> Live
          </ToggleButton>
          <ToggleButton value="manual" sx={{ borderRadius: '12px !important', px: 2, textTransform: 'none', fontWeight: 600, border: 'none' }}>
            <FiMapPin style={{ marginRight: 6 }} /> Manual
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* SET LOCATION MANUALLY MODAL */}
      {showPicker && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: 'blur(4px)',
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ background: "#fff", borderRadius: 4, padding: 3, minWidth: 350, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Set Your Location</Typography>
            <MapPicker
              initialCenter={location}
              avatarUser={user}
              onConfirm={handleManualLocation}
              onCancel={() => {
                setShowPicker(false);
                setMode("live"); // Revert mode if cancelled
              }}
            />
          </Box>
        </Box>
      )}

      {/* SLIDE-OUT DRAWER */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'left'}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 350,
            height: isMobile ? '50vh' : '100%',
            borderTopLeftRadius: isMobile ? 24 : 0,
            borderTopRightRadius: 24,
            borderBottomRightRadius: isMobile ? 0 : 24,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            fontFamily: 'Inter, sans-serif',
          }
        }}
      >
        {selectedUser && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3, boxSizing: 'border-box' }}>
            {/* Drag handle for mobile */}
            {isMobile && (
              <Box sx={{ width: 40, height: 4, bgcolor: '#ccc', borderRadius: 2, mx: 'auto', mb: 2 }} />
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Avatar 
                src={selectedUser.businessLogo || selectedUser.profilePic} 
                sx={{ width: 80, height: 80, border: '3px solid #1976d2' }}
              />
              <IconButton onClick={() => setIsDrawerOpen(false)}>
                <FiX />
              </IconButton>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111', mb: 0.5 }}>
              {selectedUser.shopName || selectedUser.name}
            </Typography>
            
            <Typography variant="subtitle1" sx={{ color: '#555', mb: 2, textTransform: 'capitalize' }}>
              {selectedUser.role} {selectedUser.businessCategory ? `• ${selectedUser.businessCategory}` : ''}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: selectedUser.isOnline ? '#4CAF50' : '#9e9e9e' }} />
              <Typography variant="body2" color="text.secondary">
                {selectedUser.isOnline ? 'Online now' : 'Offline'}
              </Typography>
            </Box>

            {selectedUser.businessDescription && (
              <Typography variant="body2" sx={{ color: '#444', mb: 3, lineHeight: 1.6 }}>
                {selectedUser.businessDescription}
              </Typography>
            )}

            <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
              {user.role === 'customer' && selectedUser.role === 'retailer' && (
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handleFollow}
                  sx={{ 
                    bgcolor: user.followedRetailers?.includes(selectedUser._id) ? '#e0e0e0' : '#1976d2', 
                    color: user.followedRetailers?.includes(selectedUser._id) ? '#333' : '#fff',
                    borderRadius: 8, 
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: user.followedRetailers?.includes(selectedUser._id) ? 'none' : '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                       bgcolor: user.followedRetailers?.includes(selectedUser._id) ? '#d5d5d5' : '#1565c0', 
                    }
                  }}
                >
                  {user.followedRetailers?.includes(selectedUser._id) ? 'Unfollow' : 'Follow'}
                </Button>
              )}
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleVisitProfile}
                sx={{ 
                  borderRadius: 8, 
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#1976d2',
                  color: '#1976d2'
                }}
              >
                View Profile
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

export default MapDashboardView;
