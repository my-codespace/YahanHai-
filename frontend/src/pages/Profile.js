import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../api/index';

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserProfile(id)
      .then(setUser)
      .catch(() => setError('Failed to load profile'));
  }, [id]);

  if (error) return <div className="centered-error">{error}</div>;
  if (!user) return <div style={{ padding: 32, textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div className="main-container">
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--primary)', 
          cursor: 'pointer', 
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '16px',
          padding: 0
        }}
      >
        &larr; Back
      </button>

      <div className="profile-card">
        <img
          src={user?.profilePic ? `http://localhost:5000/${user.profilePic}` : '/default-avatar.png'}
          alt={user.name}
          className="profile-avatar-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-avatar.png';
          }}
        />
        <div className="profile-details">
          <h1 className="profile-name">
            {user.name}
            <span style={{ fontSize: '1rem', fontWeight: 500, color: '#888', marginLeft: '12px', textTransform: 'capitalize' }}>
              ({user.role})
            </span>
          </h1>
          <div className="profile-row">
            <span className="profile-label">Email:</span>
            <span>{user.email || 'N/A'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Location:</span>
            <span>{user.city || 'N/A'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Phone:</span>
            <span>{user.phone || 'N/A'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Interest:</span>
            <span>{user.interest || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
