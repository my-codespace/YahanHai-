import React, { useState, useEffect } from 'react';
import { getInterestedCustomers } from '../api/index.js';
import { Link } from 'react-router-dom';

function InterestedCustomers({ user }) {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'retailer') {
      getInterestedCustomers(user._id)
        .then(data => {
          setCustomers(data);
          setError(null);
        })
        .catch(err => {
          setError(err.message);
          setCustomers([]);
        });
    }
  }, [user?._id]);

  if (user?.role !== 'retailer') return <div style={{ padding: 24, textAlign: 'center', color: '#d32f2f' }}>Not authorized</div>;

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
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 32, letterSpacing: -1 }}>
        Interested Customers
      </h1>
      {error && <div style={{ color: '#d32f2f', marginBottom: 18, fontWeight: 500 }}>{error}</div>}
      {customers.length === 0 && !error && (
        <div style={{ color: '#757575', fontStyle: 'italic', marginBottom: 20, textAlign: 'center' }}>
          No customers have followed you yet.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Array.isArray(customers) && customers.map(customer => (
          <Link
            key={customer.id}
            to={`/dashboard/profile/${customer.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              background: '#f9f9f9',
              borderRadius: 8,
              padding: '18px 24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              color: '#222',
              transition: 'background 0.2s',
            }}
          >
            <img
              src={user?.profilePic ? `http://localhost:5000/${user.profilePic}` : '/default-avatar.png'}
              alt={customer.name}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: 24,
                background: '#e0e0e0',
              }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{customer.name}</div>
              <div style={{ color: '#1976d2', fontSize: 15 }}>{customer.city || 'City not set'}</div>
              <div style={{ color: '#888', fontSize: 13 }}>
                Interest: {customer.interest || 'Not specified'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default InterestedCustomers;
