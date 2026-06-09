import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import MapPanel from '../components/MapPanel';
import { getUserProfile, followRetailer, unfollowRetailer } from '../api/index';
import formatOperatingHours from '../utils/formatOperatingHours';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import { FiClock, FiPhone, FiTag, FiHeart, FiArrowLeft, FiInfo, FiLayers } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const getMockProducts = (category) => {
  const normalized = (category || '').toLowerCase();
  if (normalized.includes('food') || normalized.includes('restaurant') || normalized.includes('cafe')) {
    return [
      { name: "Special House Burger", desc: "Crafted with premium ingredients, served with golden fries", price: "$12.99" },
      { name: "Avocado Sourdough Toast", desc: "Fresh avocado, cherry tomatoes, and microgreens on rustic sourdough", price: "$9.50" },
      { name: "Signature Iced Latte", desc: "Locally roasted espresso, chilled milk, and house-made vanilla syrup", price: "$4.75" }
    ];
  } else if (normalized.includes('cloth') || normalized.includes('fashion') || normalized.includes('boutique')) {
    return [
      { name: "Classic Denim Jacket", desc: "Vintage-washed, premium cotton denim with standard buttons", price: "$69.00" },
      { name: "Minimalist Leather Tote", desc: "Hand-stitched genuine leather, spacious daily carry bag", price: "$110.00" },
      { name: "Organic Cotton Tee", desc: "Super-soft, breathable minimalist essentials tee", price: "$24.50" }
    ];
  } else if (normalized.includes('grocery') || normalized.includes('supermarket')) {
    return [
      { name: "Organic Farm Fresh Basket", desc: "Seasonal hand-picked organic fruits and vegetables", price: "$29.99" },
      { name: "Premium Artisan Cheese Board", desc: "Assortment of locally sourced gourmet cheeses", price: "$18.50" },
      { name: "Cold-Pressed Juice Pack", desc: "Set of 6 nutrient-dense organic vegetable/fruit juices", price: "$22.00" }
    ];
  } else {
    return [
      { name: "Premium Service Package", desc: "Standard introductory offering tailored to your specific needs", price: "$49.99" },
      { name: "Professional Consultation", desc: "1-hour deep-dive advisory session with our lead specialists", price: "$85.00" },
      { name: "Express Custom Delivery", desc: "Priority delivery tracking option for local addresses", price: "$9.99" }
    ];
  }
};

const getMockReviews = () => {
  return [
    { reviewer: "Aisha Sharma", rating: 5, date: "2 days ago", text: "Amazing service! The live tracking updates make it super convenient to know exactly when the retailer is open and nearby." },
    { reviewer: "Rohan Verma", rating: 4, date: "1 week ago", text: "Great quality and friendly staff. Highly recommend following them for proximity notifications!" }
  ];
};

function RetailerProfile({ user, setUser }) {
  const { id: retailerId } = useParams();
  const navigate = useNavigate();
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
    if (!retailerId) return;
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    socket.on('user-status-changed', ({ userId, isOnline }) => {
      if (userId === retailerId) {
        setRetailer(prev => prev ? { ...prev, isOnline } : null);
      }
    });
    return () => socket.disconnect();
  }, [retailerId]);

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
    } catch (err) {
      console.error('Error updating follow status:', err);
      setError('Failed to update follow status. Please try again.');
    }
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return '/default-business.png';
    return resolveAssetUrl(logoPath);
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return resolveAssetUrl(photoPath);
  };

  if (error) {
    return (
      <div className="centered-error">
        {error}
      </div>
    );
  }

  if (!retailer) {
    return (
      <div style={{ padding: 48, textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
        Loading retailer profile...
      </div>
    );
  }

  if (!retailer.location) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#d32f2f', fontSize: '1.2rem' }}>
        Retailer location not available.
      </div>
    );
  }

  const products = getMockProducts(retailer.businessCategory);
  const reviews = getMockReviews();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(12px, 4vw, 24px)', paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }} className="retailer-profile-page">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--primary)', 
          cursor: 'pointer', 
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '20px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'opacity 0.2s'
        }}
      >
        <FiArrowLeft /> Back
      </button>

      {/* Header Profile Section */}
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        padding: 'clamp(16px, 5vw, 32px)',
        marginBottom: '24px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <img
          src={getLogoUrl(retailer.businessLogo)}
          alt="Business Logo"
          style={{ 
            width: 110, 
            height: 110, 
            borderRadius: '16px', 
            objectFit: 'cover',
            border: '3px solid var(--primary)',
            boxShadow: '0 4px 12px rgba(33,150,243,0.1)',
            flexShrink: 0 
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-business.png';
          }}
        />
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)' }}>
              {retailer.shopName || retailer.name}
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: retailer.isOnline ? '#e8f5e9' : '#f5f5f5',
              color: retailer.isOnline ? '#2e7d32' : '#616161',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: retailer.isOnline ? '#4caf50' : '#9e9e9e'
              }} />
              {retailer.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          
          <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiTag style={{ color: 'var(--primary)' }} />
            {retailer.businessCategory || 'General'}
          </p>

          {user?.role === 'customer' && (
            <button
              onClick={handleFollow}
              style={{
                background: isFollowing ? 'transparent' : 'var(--primary)',
                color: isFollowing ? 'var(--primary)' : '#fff',
                border: `2px solid var(--primary)`,
                borderRadius: '8px',
                padding: '8px 20px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: isFollowing ? 'none' : '0 4px 12px rgba(25, 118, 210, 0.2)'
              }}
            >
              <FiHeart fill={isFollowing ? 'var(--primary)' : 'none'} />
              {isFollowing ? 'Following ✓' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="retailer-profile-layout">
        
        {/* Left Column: Business Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Business Details Card */}
          <div className="retailer-info-card">
            
            <div className="retailer-detail-item">
              <FiInfo />
              <div className="retailer-detail-content">
                <h4>Description</h4>
                <p>{retailer.businessDescription || 'No description provided.'}</p>
              </div>
            </div>

            <div className="retailer-detail-item">
              <FiClock />
              <div className="retailer-detail-content">
                <h4>Operating Hours</h4>
                <p>{formatOperatingHours(retailer.operatingHours)}</p>
              </div>
            </div>

            <div className="retailer-detail-item">
              <FiPhone />
              <div className="retailer-detail-content">
                <h4>Phone Contact</h4>
                <p>{retailer.phone || 'N/A'}</p>
              </div>
            </div>
            
            {retailer.deliveryAvailable !== undefined && (
              <div className="retailer-detail-item">
                <FiLayers />
                <div className="retailer-detail-content">
                  <h4>Delivery Service</h4>
                  <p>{retailer.deliveryAvailable ? 'Available ✓' : 'In-Store Pickup Only'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Storefront Image Card */}
          {(retailer.storefrontPhoto || retailer.ownerPhoto) && (
            <div className="retailer-info-card" style={{ padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Storefront & Owner
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {retailer.storefrontPhoto && (
                  <img 
                    src={getPhotoUrl(retailer.storefrontPhoto)} 
                    alt="Storefront" 
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }} 
                  />
                )}
                {retailer.ownerPhoto && (
                  <img 
                    src={getPhotoUrl(retailer.ownerPhoto)} 
                    alt="Owner" 
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }} 
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Map, Products, Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Map Card */}
          <div style={{ overflow: 'hidden', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
            <MapPanel
              location={retailer.location}
              markers={[{ ...retailer, isOnline: retailer.isOnline }]}
              user={user}
            />
          </div>

          {/* Products & Services Card */}
          <div className="retailer-content-section">
            <h3 className="retailer-section-title">
              <FiLayers /> Products & Services
            </h3>
            <div className="product-card-grid">
              {products.map((p, idx) => (
                <div key={idx} className="product-card">
                  <h4 className="product-name">{p.name}</h4>
                  <p className="product-desc">{p.desc}</p>
                  <span className="product-price">{p.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Card */}
          <div className="retailer-content-section">
            <h3 className="retailer-section-title">
              <FiTag /> Customer Reviews
            </h3>
            <div className="review-list">
              {reviews.map((r, idx) => (
                <div key={idx} className="review-card">
                  <div className="review-header">
                    <div>
                      <span className="reviewer-name">{r.reviewer}</span>
                      <span className="review-date"> • {r.date}</span>
                    </div>
                    <div className="review-rating">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <FaStar key={starIdx} color={starIdx < r.rating ? '#ffb74d' : '#e0e0e0'} size={14} />
                      ))}
                    </div>
                  </div>
                  <p className="review-text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetailerProfile;
