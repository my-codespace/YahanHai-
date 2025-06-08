import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import createAvatarIcon from '../utils/createAvatarIcon';

export default function MapPanel({ location, markers, role, user }) {
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
            {user.name || user.shopName}
          </Popup>
        </Marker>
        {/* Other users */}
        {markers.map((marker, idx) => (
          <Marker
            key={idx}
            position={[marker.lat, marker.lng]}
            icon={createAvatarIcon(marker)}
          >
            <Popup>
              <b>{marker.name || marker.shopName}</b>
              <br />
              {marker.role === 'retailer' ? 'Retailer' : 'Customer'}
              <br />
              {marker.email || marker.businessCategory || marker.city}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
