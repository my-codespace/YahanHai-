// src/components/ProfileCard.js
import React from 'react';

export default function ProfileCard({ user }) {
  // For customers: show profilePic, for retailers: show businessLogo and retailerPhoto
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: 24,
      minHeight: 220
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {user.role === 'customer' && user.profilePic && (
          <img
            src={`http://localhost:5000/${user.profilePic}`}
            alt="Profile"
            style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #1976d2'
            }}
          />
        )}
        {user.role === 'retailer' && user.businessLogo && (
          <img
            src={`http://localhost:5000/${user.businessLogo}`}
            alt="Business Logo"
            style={{
              width: 70,
              height: 70,
              borderRadius: 12,
              objectFit: 'cover',
              border: '2px solid #1976d2'
            }}
          />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#1976d2' }}>
            {user.name}
          </div>
          <div style={{ color: '#666', fontSize: 15 }}>
            {user.email}
          </div>
          <div style={{ color: '#666', fontSize: 15 }}>
            {user.phone}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        {user.role === 'customer' && (
          <>
            <div><b>City:</b> {user.city}</div>
            <div><b>Interests:</b> {user.interest}</div>
            <div><b>Date of Birth:</b> {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</div>
          </>
        )}
        {user.role === 'retailer' && (
          <>
            <div><b>Shop Name:</b> {user.shopName}</div>
            <div><b>Category:</b> {user.businessCategory}</div>
            <div><b>GSTIN:</b> {user.gstin || 'N/A'}</div>
          </>
        )}
      </div>
    </div>
  );
}
