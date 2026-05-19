import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead } from '../api/index';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  CircularProgress, 
  Paper,
  Badge,
  useTheme,
  Fade,
  Chip,
  Container
} from '@mui/material';
import { FiBell, FiClock, FiCheckCircle, FiInfo } from 'react-icons/fi';

function NotificationsView() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
    
    if (notification.sender?._id) {
      navigate(`/dashboard/retailer/${notification.sender._id}`);
    }
  };

  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.1)',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative'
  };

  const darkGlassStyle = {
    background: 'rgba(18, 18, 18, 0.75)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.4)',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative'
  };

  const isDark = document.body.classList.contains('dark');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 100px)', pt: { xs: 8, sm: 2 } }}>
      <Paper 
        elevation={0}
        sx={{
           ...(isDark ? darkGlassStyle : glassmorphismStyle),
           height: '100%',
           display: 'flex',
           flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          p: { xs: 2.5, sm: 4 }, 
          borderBottom: '1px solid', 
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: isDark ? 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(18,18,18,0) 100%)' : 'linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(255,255,255,0) 100%)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
             <Avatar sx={{ 
               bgcolor: theme.palette.primary.main, 
               width: { xs: 48, sm: 56 }, 
               height: { xs: 48, sm: 56 },
               boxShadow: `0 8px 16px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(25,118,210,0.2)'}`
             }}>
               <FiBell size={28} color="#fff" />
             </Avatar>
             <Box>
               <Typography variant="h4" sx={{ 
                 fontWeight: 800, 
                 color: isDark ? '#fff' : '#1a1a1a', 
                 letterSpacing: '-0.5px',
                 fontSize: { xs: '1.5rem', sm: '2rem' }
               }}>
                 Notifications
               </Typography>
               <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary', fontWeight: 500 }}>
                 Stay updated with your latest alerts
               </Typography>
             </Box>
          </Box>
          <Chip 
            label={`${notifications.filter(n => !n.isRead).length} New`} 
            color="primary" 
            sx={{ 
              fontWeight: 700, 
              borderRadius: '12px',
              px: 1,
              py: 2.5,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(25,118,210,0.3)'
            }} 
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={48} thickness={4} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.7 }}>
              <Box sx={{ 
                width: 120, height: 120, borderRadius: '50%', 
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3
              }}>
                <FiInfo size={56} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', mb: 1 }}>All caught up!</Typography>
              <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>You have no new notifications.</Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {notifications.map((notif, index) => (
                <Fade in={true} timeout={300 + (index * 150)} key={notif._id}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      borderRadius: '20px',
                      background: notif.isRead 
                        ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)') 
                        : (isDark ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.06)'),
                      border: '1px solid',
                      borderColor: notif.isRead ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') : (isDark ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)'),
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      p: 2.5,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.5)' : '0 12px 24px rgba(0,0,0,0.08)',
                        background: notif.isRead 
                          ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
                          : (isDark ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)'),
                      },
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {!notif.isRead && (
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          left: 0, 
                          top: 0, 
                          bottom: 0, 
                          width: '6px', 
                          background: theme.palette.primary.main,
                          borderRadius: '6px 0 0 6px'
                        }} 
                      />
                    )}
                    <ListItemAvatar sx={{ mt: 0, mr: 2 }}>
                      <Badge
                        color="error"
                        variant="dot"
                        invisible={notif.isRead}
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        sx={{ '& .MuiBadge-badge': { width: 14, height: 14, borderRadius: '50%', border: `2px solid ${isDark ? '#121212' : '#fff'}` } }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: notif.isRead ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'rgba(25, 118, 210, 0.15)',
                            color: notif.isRead ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') : theme.palette.primary.main,
                            width: 56,
                            height: 56
                          }}
                        >
                          <FiInfo size={28} />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: notif.isRead ? 500 : 700,
                            color: isDark ? '#fff' : '#1a1a1a',
                            mb: 1,
                            lineHeight: 1.4,
                            fontSize: '1.1rem'
                          }}
                        >
                          {notif.message}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', px: 1.5, py: 0.5, borderRadius: '12px' }}>
                            <FiClock size={14} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {new Date(notif.createdAt).toLocaleString(undefined, { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                    {notif.isRead && (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', alignSelf: 'center', ml: 2 }}>
                        <FiCheckCircle size={28} />
                      </Box>
                    )}
                  </ListItem>
                </Fade>
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default NotificationsView;
