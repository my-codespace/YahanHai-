import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function createAvatarIcon(user) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative">
        <img src="${user.profilePic || user.businessLogo || '/default-avatar.png'}" 
             style="width:32px;height:32px;border-radius:50%;border:2px solid ${user.isOnline ? '#4CAF50' : '#757575'}"/>
        <div style="
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${user.isOnline ? '#4CAF50' : '#757575'};
          border: 2px solid white;
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
}

export default function MapView({ center, markers = [] }) {
  if (!center?.lat || !center?.lng) return <div>Loading map...</div>;

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={15} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {markers.map((m, i) => (
        <Marker
          key={i}
          position={[m.lat, m.lng]}
          icon={createAvatarIcon(m)}
        >
          <Popup>
            <div style={{ minWidth: 200 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{m.shopName || m.name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: m.isOnline ? '#4CAF50' : '#757575'
                }} />
                <small>{m.isOnline ? 'Online now' : `Last seen ${m.lastSeen ? new Date(m.lastSeen).toLocaleString() : 'unknown'}`}</small>
              </div>
              {m.businessCategory && <p style={{ margin: 4 }}>Category: {m.businessCategory}</p>}
              {m.operatingHours && <p style={{ margin: 4 }}>Hours: {m.operatingHours}</p>}
              {m.phone && <p style={{ margin: 4 }}>📞 {m.phone}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
