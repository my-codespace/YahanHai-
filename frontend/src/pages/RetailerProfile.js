import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MapPanel from '../components/MapPanel';
import { getUserProfile, followRetailer, unfollowRetailer } from '../api/index';

function RetailerProfile({ user, setUser }) {
  const { id: retailerId } = useParams();
  const [retailer, setRetailer] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch retailer data
  useEffect(() => {
    setError(null);
    getUserProfile(retailerId)
      .then(data => setRetailer(data))
      .catch(err => {
        console.error('Error fetching retailer:', err);
        setError('Failed to load retailer profile. Please try again.');
      });
  }, [retailerId]);

  // Update isFollowing status based on user's followedRetailers
  useEffect(() => {
    if (user && user.role === 'customer' && retailerId) {
      setIsFollowing(user.followedRetailers?.includes(retailerId));
    }
  }, [user, retailerId]);

  // Socket.IO for real-time status updates
  useEffect(() => {
    if (!retailer) return;
    const socket = io('http://localhost:5000');
    socket.on('user-status-changed', ({ userId, isOnline }) => {
      if (userId === retailer._id) setRetailer(prev => ({ ...prev, isOnline }));
    });
    return () => socket.disconnect();
  }, [retailer]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowRetailer(user._id, retailerId);
      } else {
        await followRetailer(user._id, retailerId);
      }
      // Fetch the updated user profile and update the user state in the app
      const updatedUser = await getUserProfile(user._id);
      setUser(updatedUser);
      // isFollowing will update automatically via useEffect when user changes
    } catch (err) {
      console.error('Error updating follow status:', err);
      setError('Failed to update follow status. Please try again.');
    }
  };

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'red' }}>
        {error}
      </div>
    );
  }

  if (!retailer) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        Loading retailer profile...
      </div>
    );
  }

  if (!retailer.location) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'red' }}>
        Retailer location not available.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>{retailer.shopName || retailer.name}</h1>
      <div style={{ display: 'flex', gap: 24, flexDirection: 'row' }}>
        <div style={{ flex: 1 }}>
          {retailer.businessLogo && (
            <img
              src={retailer.businessLogo}
              alt="Logo"
              style={{ width: 120, height: 120, borderRadius: 8, marginBottom: 16 }}
            />
          )}
          <p><strong>Category:</strong> {retailer.businessCategory}</p>
          <p><strong>Description:</strong> {retailer.businessDescription}</p>
          <p><strong>Hours:</strong> {retailer.operatingHours}</p>
          <p><strong>Phone:</strong> {retailer.phone}</p>
          {user?.role === 'customer' && (
            <button
              onClick={handleFollow}
              style={{
                background: isFollowing ? '#1976d2' : 'transparent',
                color: isFollowing ? '#fff' : '#1976d2',
                border: isFollowing ? 'none' : '1px solid #1976d2',
                borderRadius: 8,
                padding: '8px 16px',
                fontWeight: 600,
                marginTop: 16,
                cursor: 'pointer',
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        <div style={{ flex: 2 }}>
          <MapPanel
            location={retailer.location}
            markers={[{ ...retailer, isOnline: retailer.isOnline }]}
            user={user}
          />
          <div style={{ marginTop: 16 }}>
            <h3>Products/Services</h3>
            <p>Products and services will be listed here.</p>
          </div>
          <div style={{ marginTop: 16 }}>
            <h3>Reviews</h3>
            <p>Customer reviews will be listed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetailerProfile;
