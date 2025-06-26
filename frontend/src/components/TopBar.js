import React, { useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

function TopBar({ user, onLogout, onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="topbar">
      <button className="hamburger" onClick={onToggleSidebar} aria-label="Open Sidebar">☰</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src={user?.profilePic ? `http://localhost:5000/${user.profilePic}` : '/default-avatar.png'}
            alt={user?.name}
            style={{ width: 32, height: 32, borderRadius: '50%' }}
          />
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{user?.name}</span>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: 'var(--primary)',
            }}
            aria-label="Open User Menu"
          >
            ▼
          </button>
          {dropdownOpen && (
            <div className="topbar-dropdown">
              <button className="topbar-dropdown-item">
                <FaUser /> Profile
              </button>
              <button className="topbar-dropdown-item">
                <FaCog /> Settings
              </button>
              <button
                className="topbar-dropdown-item"
                onClick={onLogout}
                style={{ color: '#d32f2f' }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
