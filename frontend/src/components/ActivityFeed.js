// src/components/QuickActions.js
import React from 'react';

export default function QuickActions({ role, location }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: 24,
      minHeight: 220,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      justifyContent: 'center'
    }}>
      <h3 style={{ color: '#1976d2', margin: 0, marginBottom: 12 }}>Quick Actions</h3>
      {role === 'customer' ? (
        <>
          <button style={actionBtn}>Check In</button>
          <button style={actionBtn}>Invite Friend</button>
        </>
      ) : (
        <>
          <button style={actionBtn}>Add Offer</button>
          <button style={actionBtn}>Update Location</button>
        </>
      )}
    </div>
  );
}

const actionBtn = {
  background: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '10px 0',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 16
};
