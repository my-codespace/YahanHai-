import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import createAvatarIcon from "../utils/createAvatarIcon";

export default function MapPicker({ initialCenter, avatarUser, onConfirm, onCancel }) {
  const [marker, setMarker] = useState(initialCenter);
  const markerRef = useRef();

  return (
    <div>
      <MapContainer center={marker} zoom={15} style={{ height: "300px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker
          position={marker}
          icon={createAvatarIcon(avatarUser)}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const newPos = e.target.getLatLng();
              setMarker(newPos);
            }
          }}
          ref={markerRef}
        >
          <Popup>Drag to set your location</Popup>
        </Marker>
      </MapContainer>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button
          onClick={() => onConfirm(marker)}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 600,
            marginRight: 10
          }}
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          style={{
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 600
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
