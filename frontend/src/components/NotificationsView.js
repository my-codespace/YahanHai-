import React from 'react';

function NotificationsView() {
  const notifications = [
    { id: 1, text: 'New retailer joined nearby', time: '2 hours ago' },
    { id: 2, text: 'Your location was updated', time: '1 day ago' },
    { id: 3, text: 'Welcome to Live-Locator!', time: '1 week ago' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Notifications</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notifications.map(notif => (
          <li key={notif.id} style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div>{notif.text}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{notif.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationsView;
