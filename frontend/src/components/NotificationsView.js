import React from 'react';
import Card from './Card';

function NotificationsView() {
  const notifications = [
    { id: 1, text: 'New retailer joined nearby', time: '2 hours ago' },
    { id: 2, text: 'Your location was updated', time: '1 day ago' },
    { id: 3, text: 'Welcome to Live-Locator!', time: '1 week ago' },
  ];

  return (
    <Card>
      <h2 style={{ marginTop: 0 }}>Notifications</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notifications.map(notif => (
          <li
            key={notif.id}
            className="notification-item"
          >
            <div>{notif.text}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{notif.time}</div>
          </li>
          
        ))}
      </ul>
    </Card>
  );
}

export default NotificationsView;
