// src/components/StatsCard.js
import React from 'react';

export default function StatsCard({ stats, role }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: 24,
      minHeight: 220,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <h3 style={{ color: '#1976d2', margin: 0, marginBottom: 12 }}>Your Stats</h3>
      {role === 'customer' ? (
        <>
          <div><b>Retailers Followed:</b> {stats.followedRetailers}</div>
          <div><b>Check-ins:</b> {stats.checkIns}</div>
          <div><b>Profile Completeness:</b> {stats.profileCompleteness}%</div>
        </>
      ) : (
        <>
          <div><b>Followers:</b> {stats.followers}</div>
          <div><b>Visits:</b> {stats.visits}</div>
          <div><b>Business Completeness:</b> {stats.businessCompleteness}%</div>
        </>
      )}
    </div>
  );
}
