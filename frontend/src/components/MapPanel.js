import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import createAvatarIcon from '../utils/createAvatarIcon';

export default function MapPanel({ location, markers, role, user }) {
  const navigate = useNavigate();

  if (!location) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        minHeight: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span>Loading map...</span>
      </div>
    );
  }

  const handleVisitProfile = (marker) => {
    if (marker?.role === 'retailer' && marker?._id) {
      navigate(`/dashboard/retailer/${marker._id}`);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: 0,
      minHeight: 320,
      overflow: 'hidden'
    }}>
      <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: 320, width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {/* Current user marker */}
        <Marker
          position={[location.lat, location.lng]}
          icon={createAvatarIcon(user)}
        >
          <Popup>
            {role === 'customer' ? 'You are here' : 'Your business'}
            <br />
            {user?.name || user?.shopName}
          </Popup>
        </Marker>
        {/* Other users */}
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
              <div style={{ minWidth: 200 }}>
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
                {/* Add Visit Profile button for retailers */}
                {marker?.role === 'retailer' && (
                  <button
                    onClick={() => handleVisitProfile(marker)}
                    style={{
                      marginTop: 8,
                      padding: '6px 12px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Visit Profile
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
