import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile } from '../api/index';

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserProfile(id)
      .then(setUser)
      .catch(() => setError('Failed to load profile'));
  }, [id]);

  if (error) return <div style={{ color: '#d32f2f', padding: 32, textAlign: 'center' }}>{error}</div>;
  if (!user) return <div style={{ padding: 32, textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '32px auto 0 auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        padding: '36px 48px',
        minHeight: 400,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 48,
      }}
    >
      <img
        src={user.profilePic || '/default-avatar.png'}
        alt={user.name}
        style={{
          width: 110,
          height: 110,
          borderRadius: '50%',
          objectFit: 'cover',
          background: '#e0e0e0',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(33,150,243,0.08)',
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: '#1976d2', letterSpacing: -1 }}>
          {user.name}
        </h1>
        <div style={{ display: 'flex', gap: 18, fontSize: '1.1rem', alignItems: 'center' }}>
          <span style={{ color: '#888', fontWeight: 500, minWidth: 80 }}>Email:</span>
          <span>{user.email}</span>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: '1.1rem', alignItems: 'center' }}>
          <span style={{ color: '#888', fontWeight: 500, minWidth: 80 }}>City:</span>
          <span>{user.city || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: '1.1rem', alignItems: 'center' }}>
          <span style={{ color: '#888', fontWeight: 500, minWidth: 80 }}>Interest:</span>
          <span>{user.interest || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: '1.1rem', alignItems: 'center' }}>
          <span style={{ color: '#888', fontWeight: 500, minWidth: 80 }}>Phone:</span>
          <span>{user.phone || 'N/A'}</span>
        </div>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
}

export default Profile;
