import React from 'react';

function TopBar({ user, onLogout, onToggleSidebar }) {
  return (
    <div className="topbar">
      <button className="hamburger" onClick={onToggleSidebar}>☰</button>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <div>
          <h3 style={{ margin: 0, color: '#1976d2' }}>
            Welcome, {user?.name || 'User'}!
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
            {user?.role === 'customer' ? 'Customer' : 'Retailer'} Dashboard
          </p>
        </div>
      </div>
      <button
        className="logout"
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default TopBar;
