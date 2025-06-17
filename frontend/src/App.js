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

    const socket = io('http://localhost:5000', {
      query: { userId: user._id }
    });

    socket.on('retailer-online', ({ retailerId, retailerName }) => {
      toast.info(`${retailerName} is now online!`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    return () => {
      socket.off('retailer-online');
      socket.disconnect();
    };
  }, [user?._id]);

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;
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
        <Route path="map" element={<MapDashboardView user={user} />} />
        <Route path="retailer/:id" element={<RetailerProfile user={user} setUser={setUser} />} />
        <Route path="analytics" element={<AnalyticsView />} />
        <Route path="notifications" element={<NotificationsView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="edit-profile" element={<EditProfile user={user} setUser={setUser} />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="interested-customers" element={<InterestedCustomers user={user} />} />
        <Route index element={<Navigate to="map" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ToastContainer />
      <AppWrapper />
    </Router>
  );
}
