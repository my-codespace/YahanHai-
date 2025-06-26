import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import createAvatarIcon from '../utils/createAvatarIcon';

// Floating action button for "My Location"
function MyLocationButton({ location }) {
  const map = useMap();
  const handleClick = () => {
    map.flyTo([location.lat, location.lng], 15, { animate: true });
  };
  return (
    <button
      className="map-fab"
      title="Center on My Location"
      aria-label="Center on My Location"
      onClick={handleClick}
    >
      <span role="img" aria-label="My Location" style={{ fontSize: 22 }}>📍</span>
    </button>
  );
}

export default function MapPanel({ location, markers, role, user }) {
  const navigate = useNavigate();

  if (!location) {
    return (
      <div className="map-card" style={{
        minHeight: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span className="map-helper-text">Fetching your location…</span>
      </div>
    );
  }

  const handleVisitProfile = (marker) => {
    if (marker?.role === 'retailer' && marker?._id) {
      navigate(`/dashboard/retailer/${marker._id}`);
    }
  };

  return (
    <div className="map-card">
      <div className="map-header">
        <h2 className="map-title">Explore Nearby</h2>
      </div>
      <div className="map-container">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%', borderRadius: 12 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker
            position={[location.lat, location.lng]}
            icon={createAvatarIcon(user)}
          >
            <Popup>
              <strong>{role === 'customer' ? 'Your Current Location' : 'Your Business'}</strong>
              <br />
              {user?.name || user?.shopName}
            </Popup>
          </Marker>
          {markers.filter(Boolean).map((marker, idx) => (
            <Marker
              key={idx}
              position={[
                marker?.lat ?? marker?.location?.lat,
                marker?.lng ?? marker?.location?.lng
              ]}
              icon={createAvatarIcon(marker)}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>
                    {marker?.shopName || marker?.name || 'Unknown'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: marker?.isOnline ? '#4CAF50' : '#757575'
                    }} />
                    <small>
                      {marker?.isOnline
                        ? 'Online now'
                        : `Last active: ${marker?.lastSeen ? new Date(marker.lastSeen).toLocaleTimeString() : 'unknown'}`}
                    </small>
                  </div>
                  {marker?.role && <div style={{ marginBottom: 4 }}>{marker.role.charAt(0).toUpperCase() + marker.role.slice(1)}</div>}
                  {marker?.email && <div style={{ marginBottom: 4 }}>{marker.email}</div>}
                  {marker?.businessCategory && <div style={{ marginBottom: 4 }}>Category: {marker.businessCategory}</div>}
                  {marker?.operatingHours && <div style={{ marginBottom: 4 }}>Hours: {marker.operatingHours}</div>}
                  {marker?.phone && <div style={{ marginBottom: 4 }}>📞 {marker.phone}</div>}
                  {marker?.role === 'retailer' && (
                    <button
                      onClick={() => handleVisitProfile(marker)}
                      className="map-profile-btn"
                    >
                      View Profile
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          <MyLocationButton location={location} />
        </MapContainer>
      </div>
      <div className="map-helper-text">
        Tap <span role="img" aria-label="location">📍</span> to center on your current position.
      </div>
    </div>
  );
}
