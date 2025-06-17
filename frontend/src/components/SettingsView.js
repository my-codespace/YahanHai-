import React, { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

function SettingsView() {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved === 'true';
  });

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', newValue);
    // Optional: Request permission for browser notifications
    if (newValue && window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="settings-panel" style={{ padding: 24 }}>
      <h2>Settings</h2>
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          Enable dark mode
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={toggleNotifications}
          />
          Enable notifications
        </label>
      </div>
    </div>
  );
}

export default SettingsView;
