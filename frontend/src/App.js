import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { io } from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';
import Register from './pages/Register';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import MapDashboardView from './components/MapDashboardView';
import AnalyticsView from './components/AnalyticsView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import EditProfile from './pages/EditProfile';
import RetailerProfile from './pages/RetailerProfile';
import InterestedCustomers from './pages/InterestedCustomers';
import Profile from './pages/Profile';
import { getUserProfile } from './api/index';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';

function AppWrapper() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleAuth = (token, role, userData) => {
    setToken(token);
    setRole(role);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userData._id);
    navigate('/dashboard/map');
  };

  const handleLogout = useCallback(() => {
    setToken('');
    setRole('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }, []);

  // Fetch user profile after login or on app load
  useEffect(() => {
    if (token) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const fetchUser = async () => {
          try {
            const userData = await getUserProfile(userId);
            setUser(userData);
          } catch (err) {
            console.error('Failed to fetch user profile:', err);
            handleLogout();
          } finally {
            setLoading(false);
          }
        };
        fetchUser();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token, handleLogout]);

  // Socket.IO setup and cleanup
  useEffect(() => {
    if (!user?._id) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      query: { 
        userId: user._id,
        isOnline: localStorage.getItem('isOnlineStatus') !== 'false'
      }
    });

    socket.on('retailer-online', ({ retailerId, retailerName }) => {
      toast.info(`${retailerName} is now online!`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    socket.on('proximity_alert', (notification) => {
      toast.success(`📍 ${notification.message}`, {
        position: "top-center",
        autoClose: 8000,
      });
    });

    return () => {
      socket.off('retailer-online');
      socket.off('proximity_alert');
      socket.disconnect();
    };
  }, [user?._id]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #63a4ff 100%)',
        fontFamily: 'Inter, Arial, sans-serif'
      }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.25); opacity: 1; }
          }
        `}</style>
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: 20,
          padding: '32px 48px',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
          textAlign: 'center',
          color: '#1976d2',
          fontWeight: 600,
          fontSize: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#1976d2',
            animation: 'pulse 1.4s infinite ease-in-out'
          }}></div>
          <span>Synchronizing live locator dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login onAuth={handleAuth} />} />
      <Route path="/register" element={<Register onAuth={handleAuth} />} />
      <Route
        path="/dashboard/*"
        element={
          token && user ? (
            <DashboardLayout user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="map" element={<MapDashboardView user={user} setUser={setUser} />} />
        <Route path="retailer/:id" element={<RetailerProfile user={user} setUser={setUser} />} />
        <Route path="analytics" element={<AnalyticsView />} />
        <Route path="notifications" element={<NotificationsView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="edit-profile" element={<EditProfile user={user} setUser={setUser} />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="interested-customers" element={<InterestedCustomers user={user} />} />
        <Route index element={<Navigate to="map" replace />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastContainer />
        <AppWrapper />
      </Router>
    </ErrorBoundary>
  );
}