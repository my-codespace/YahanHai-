import React, { useState, useEffect } from 'react';
import { getInterestedCustomers, getFollowedRetailers } from '../api/index.js';
import { Link } from 'react-router-dom';

function InterestedCustomers({ user }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'retailer') {
      getInterestedCustomers(user._id)
        .then(data => {
          setList(data || []);
          setError(null);
        })
        .catch(err => {
          setError(err.message);
          setList([]);
        })
        .finally(() => setLoading(false));
    } else if (user?.role === 'customer') {
      getFollowedRetailers(user._id)
        .then(data => {
          setList(data || []);
          setError(null);
        })
        .catch(err => {
          setError(err.message);
          setList([]);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?._id, user?.role]);

  const isRetailer = user?.role === 'retailer';
  const title = isRetailer ? 'Interested Customers' : 'Followed Retailers';
  const emptyText = isRetailer ? 'No customers have followed you yet.' : 'You are not following any retailers yet.';

  const getProfilePic = (person) => {
    if (person.profilePic) return `http://localhost:5000/${person.profilePic}`;
    if (person.retailerPhoto) return `http://localhost:5000/${person.retailerPhoto}`;
    if (person.businessLogo) return `http://localhost:5000/${person.businessLogo}`;
    return '/default-avatar.png'; // Fallback
  };

  return (
    <div className="main-container">
      <h1 className="page-title">{title}</h1>
      
      {error && <div className="error-msg">{error}</div>}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : list.length === 0 && !error ? (
        <div className="empty-msg">{emptyText}</div>
      ) : (
        <div className="customer-list">
          {list.map(person => (
            <Link
              key={person.id}
              to={`/dashboard/${isRetailer ? 'profile' : 'retailer'}/${person.id}`}
              className="customer-card-link"
            >
              <div className="customer-card">
                <img
                  src={getProfilePic(person)}
                  alt={person.name}
                  className="customer-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div className="customer-info">
                  <div className="customer-name">{person.shopName || person.name}</div>
                  <div className="customer-city">
                    {isRetailer 
                      ? 'Customer' 
                      : person.businessCategory || 'Retailer'
                    }
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default InterestedCustomers;
