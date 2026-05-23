import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Box, useMediaQuery, useTheme, Tooltip, IconButton, Badge } from '@mui/material';
import { FiMap, FiBell, FiUsers, FiUser, FiLogOut } from 'react-icons/fi';
import { getNotifications } from '../api/index';

function DashboardLayout({ user, onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'retailer') {
      getNotifications().then(data => {
        setUnreadCount(data.filter(n => !n.isRead).length);
      }).catch(console.error);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!user?._id) return;
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { 
      query: { 
        userId: user._id,
        isOnline: localStorage.getItem('isOnlineStatus') !== 'false'
      } 
    });
    
    socket.on('proximity_alert', () => {
      setUnreadCount(prev => prev + 1);
    });

    const handleNotificationRead = () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    };
    window.addEventListener('notification-read', handleNotificationRead);

    return () => {
      socket.disconnect();
      window.removeEventListener('notification-read', handleNotificationRead);
    };
  }, [user?._id]);

  const handleLogout = () => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    socket.emit('manual-logout', user._id);
    onLogout();
  };

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark', isDark);
  }, []);

  const navItems = [
    { label: 'Map', icon: <FiMap />, path: '/dashboard/map' },
    ...(user?.role !== 'retailer' ? [{ 
      label: 'Notifications', 
      icon: (
        <Badge badgeContent={unreadCount} color="error" overlap="circular" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}>
          <FiBell />
        </Badge>
      ), 
      path: '/dashboard/notifications' 
    }] : []),
    { label: user?.role === 'retailer' ? 'Customers' : 'Retailers', icon: <FiUsers />, path: '/dashboard/interested-customers' },
    { label: 'Profile', icon: <FiUser />, path: '/dashboard/edit-profile' },
  ];

  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    borderRadius: 24,
    display: 'flex',
    gap: 2,
    padding: '12px',
    zIndex: 1000,
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* The Outlet renders the MapDashboardView which contains the full-bleed map */}
      <Box sx={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, overflowY: 'auto' }}>
        <Outlet />
      </Box>

      {/* Floating Navigation Dock */}
      <Box
        sx={{
          position: 'absolute',
          ...(isMobile
            ? { bottom: 24, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row' }
            : { top: '50%', left: 24, transform: 'translateY(-50%)', flexDirection: 'column' }),
          ...glassmorphismStyle
        }}
      >
        {navItems.map((item) => (
          <Tooltip title={item.label} placement={isMobile ? 'top' : 'right'} key={item.label}>
            <NavLink
              to={item.path}
              style={({ isActive }) => ({
                color: isActive ? '#1976d2' : '#555',
                background: isActive ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                borderRadius: '50%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              })}
            >
              <Box sx={{ fontSize: 24, display: 'flex' }}>
                {item.icon}
              </Box>
            </NavLink>
          </Tooltip>
        ))}

        {/* Logout Button */}
        <Tooltip title="Logout" placement={isMobile ? 'top' : 'right'}>
          <IconButton
            onClick={handleLogout}
            sx={{
              color: '#d32f2f',
              padding: '10px',
              transition: 'all 0.3s ease',
              '&:hover': { background: 'rgba(211, 47, 47, 0.1)' }
            }}
          >
            <FiLogOut size={24} />
          </IconButton>
        </Tooltip>
      </Box>

    </Box>
  );
}

export default DashboardLayout;
