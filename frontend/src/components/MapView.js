import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import createAvatarIcon from "../utils/createAvatarIcon";

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
            <b>{m.label || m.shopName || m.name}</b>
            <br />
            {m.description || m.email || m.businessCategory || m.city}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
