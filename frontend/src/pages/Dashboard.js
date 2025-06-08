import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../api/index.js';

import CustomerDashboard from '../components/CustomerDashboard';
import RetailerDashboard from '../components/RetailerDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard({ role, token, onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  // Extract userId from token
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId);
      } catch (error) {
        console.error('Invalid token:', error);
        onLogout();
      }
    }
  }, [token, onLogout]);

  // Fetch user data
  useEffect(() => {
    if (userId) {
      getUserProfile(userId)
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch user data:', error);
          setLoading(false);
        });
    }
  }, [userId]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #63a4ff 100%)',
        color: 'white',
        fontFamily: 'Inter, Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 10 }}>Loading your dashboard...</div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>Please wait</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5',
        fontFamily: 'Inter, Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div>Failed to load user data</div>
          <button onClick={onLogout} style={{
            marginTop: 10,
            padding: '8px 16px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Inter, Arial, sans-serif',
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {role === 'customer' ? (
        <CustomerDashboard 
          user={user} 
          userId={userId} 
          token={token} 
          onLogout={onLogout}
          onUpdateUser={setUser}
        />
      ) : (
        <RetailerDashboard 
          user={user} 
          userId={userId} 
          token={token} 
          onLogout={onLogout}
          onUpdateUser={setUser}
        />
      )}
    </div>
  );
}
