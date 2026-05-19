import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import { getNotifications, markNotificationAsRead } from '../api/index';

function NotificationsView() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <Card>
      <h2 style={{ marginTop: 0 }}>Notifications</h2>
      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>You have no notifications yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map(notif => (
            <li
              key={notif._id}
              className="notification-item"
              style={{
                padding: '12px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: notif.isRead ? 'transparent' : 'rgba(var(--primary-color-rgb), 0.1)',
                cursor: 'pointer',
                borderRadius: '8px',
                marginBottom: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => handleNotificationClick(notif)}
            >
              <div style={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>{notif.message}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: '4px' }}>
                {new Date(notif.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default NotificationsView;
