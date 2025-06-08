import React from 'react';

export default function RetailerList({ retailers, followedIds, onFollow }) {
  return (
    <div className="retailer-list">
      {retailers.map(retailer => (
        <div key={retailer._id} className="retailer-card" style={{ display: "flex", alignItems: "center", marginBottom: 16, background: "#fff", borderRadius: 8, padding: 12 }}>
          <img
            src={retailer.businessLogo || "/default-business.png"}
            alt={retailer.shopName}
            style={{ width: 50, height: 50, borderRadius: "50%", marginRight: 16, objectFit: "cover" }}
          />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0 }}>{retailer.shopName}</h4>
            <p style={{ margin: "4px 0", color: "#666" }}>{retailer.businessCategory}</p>
            <button
              onClick={() => onFollow(retailer._id)}
              style={{
                background: followedIds.includes(retailer._id) ? "#1976d2" : "#e0e0e0",
                color: followedIds.includes(retailer._id) ? "#fff" : "#1976d2",
                border: "none",
                borderRadius: 6,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {followedIds.includes(retailer._id) ? "Following ✓" : "Follow"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
